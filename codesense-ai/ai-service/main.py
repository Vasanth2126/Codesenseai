import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

# --------------------------------------------------
# Configuration
# --------------------------------------------------

BASE_MODEL = "Qwen/Qwen2.5-Coder-1.5B-Instruct"
ADAPTER_PATH = "./codesenseai_finetuned"

# --------------------------------------------------
# FastAPI
# --------------------------------------------------

app = FastAPI(
    title="CodeSense AI Inference Service",
    version="1.0.0"
)

# --------------------------------------------------
# Request / Response models
# --------------------------------------------------

class GenerateRequest(BaseModel):
    question: str
    context: str = ""


class GenerateResponse(BaseModel):
    answer: str


# --------------------------------------------------
# Load model once when the service starts
# --------------------------------------------------

print("========================================")
print("CodeSense AI Inference Service")
print("========================================")

print("PyTorch:", torch.__version__)
print("CUDA available:", torch.cuda.is_available())

if torch.cuda.is_available():
    print("GPU:", torch.cuda.get_device_name(0))

print("\nLoading tokenizer...")

tokenizer = AutoTokenizer.from_pretrained(
    BASE_MODEL,
    trust_remote_code=True
)

print("Tokenizer loaded.")

print("\nLoading Qwen base model...")

model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL,
    dtype=torch.float16,
    device_map="auto",
    max_memory={
        0: "3.0GiB",
        "cpu": "12GiB"
    },
    trust_remote_code=True
)

print("Base model loaded.")

print("\nLoading CodeSenseAI LoRA adapter...")

model = PeftModel.from_pretrained(
    model,
    ADAPTER_PATH
)

model.eval()

print("LoRA adapter loaded successfully.")

print("\nModel ready.")
print("========================================")


# --------------------------------------------------
# Health endpoint
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": BASE_MODEL,
        "adapter": ADAPTER_PATH,
        "cuda_available": torch.cuda.is_available(),
    }


# --------------------------------------------------
# Generation endpoint
# --------------------------------------------------

@app.post("/generate", response_model=GenerateResponse)
def generate(request: GenerateRequest):

    try:

        if request.context.strip():

            prompt = f"""<|im_start|>system
You are CodeSense AI, an AI coding assistant.

Answer the user's question using the repository context provided below.

Repository context:
{request.context}
<|im_end|>

<|im_start|>user
{request.question}
<|im_end|>

<|im_start|>assistant
"""

        else:

            prompt = f"""<|im_start|>system
You are CodeSense AI, an AI coding assistant.
<|im_end|>

<|im_start|>user
{request.question}
<|im_end|>

<|im_start|>assistant
"""

        inputs = tokenizer(
            prompt,
            return_tensors="pt"
        )

        # Put input tensors on the same device used by the model.
        inputs = {
            key: value.to(model.device)
            for key, value in inputs.items()
        }

        with torch.no_grad():

            outputs = model.generate(
                **inputs,
                max_new_tokens=300,
                temperature=0.2,
                do_sample=True,
                top_p=0.9,
                repetition_penalty=1.05,
            )

        generated_tokens = outputs[
            0
        ][
            inputs["input_ids"].shape[1]:
        ]

        answer = tokenizer.decode(
            generated_tokens,
            skip_special_tokens=True
        ).strip()

        return GenerateResponse(
            answer=answer
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )