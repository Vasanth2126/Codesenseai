import os
import json
from threading import Thread
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM, TextIteratorStreamer
from peft import PeftModel

# --------------------------------------------------
# Configuration
# --------------------------------------------------

BASE_MODEL = "Qwen/Qwen2.5-Coder-1.5B-Instruct"
ADAPTER_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "codesenseai_finetuned")

# --------------------------------------------------
# FastAPI
# --------------------------------------------------

app = FastAPI(
    title="CodeSense AI Inference Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------------------------------
# Request / Response models
# --------------------------------------------------

class GenerateRequest(BaseModel):
    question: str
    context: str = ""
    stream: bool = False
    max_tokens: int = 1024
    temperature: float = 0.4


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

@app.post("/generate")
def generate(request: GenerateRequest):
    try:
        max_tokens = min(request.max_tokens or 1024, 2048)
        temperature = request.temperature if request.temperature is not None else 0.45

        is_readme_request = "readme" in request.question.lower()

        if is_readme_request:
            system_instruction = (
                "You are CodeSense AI, an expert technical documentation architect.\n"
                "Generate a complete, high-quality, professional README.md for this specific project based on its actual source code and structure.\n"
                "Follow standard Markdown formatting with:\n"
                "- # <Project Name>\n"
                "- ## 📌 Overview (clear summary of what this project does)\n"
                "- ## ✨ Key Features (features implemented in this project)\n"
                "- ## 🛠 Tech Stack (detected frameworks, languages, libraries, databases)\n"
                "- ## 📁 Project Structure (breakdown of primary directories and key files)\n"
                "- ## 🚀 Getting Started (prerequisites, installation, and run commands)\n\n"
                "Tailor the README specifically to this project's code. Output ONLY the complete README content in Markdown."
            )
        else:
            system_instruction = (
                "You are CodeSense AI, a senior software architect and codebase intelligence assistant.\n"
                "Analyze the repository context and provide a thorough, professional, well-structured response in GitHub Markdown using these sections:\n\n"
                "### 📌 Overview\n"
                "Clear technical summary answering the user's question directly.\n\n"
                "### 📂 Key Files & Responsibilities\n"
                "List every relevant file using backticks (`path/to/file`) with a concise explanation of its role.\n\n"
                "### 🔄 Step-by-Step Technical Flow\n"
                "Walk through the complete execution flow (e.g. Frontend UI -> API Route -> Controller/Handler -> Database/State).\n\n"
                "### 💡 Implementation Details & Endpoints\n"
                "Mention the exact endpoints, functions, and code logic.\n\n"
                "If the repository lacks direct context for the user's query, state what exists in the repository and explain the standard architectural pattern for it.\n"
                "Always be detailed, comprehensive, and well-formatted. Never give a short single-sentence answer."
            )

        if request.context.strip():
            prompt = f"""<|im_start|>system
{system_instruction}

Repository Context:
{request.context}
<|im_end|>

<|im_start|>user
{request.question}
<|im_end|>

<|im_start|>assistant
"""
        else:
            prompt = f"""<|im_start|>system
{system_instruction}
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

        inputs = {
            key: value.to(model.device)
            for key, value in inputs.items()
        }

        # Real-time token streaming if requested
        if request.stream:
            streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)
            generation_kwargs = dict(
                **inputs,
                streamer=streamer,
                max_new_tokens=max_tokens,
                temperature=temperature,
                do_sample=True,
                top_p=0.92,
                repetition_penalty=1.08,
            )
            thread = Thread(target=model.generate, kwargs=generation_kwargs)
            thread.start()

            def token_stream():
                for token in streamer:
                    yield f"data: {json.dumps({'token': token})}\n\n"
                yield "data: [DONE]\n\n"

            return StreamingResponse(token_stream(), media_type="text/event-stream")

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=max_tokens,
                temperature=temperature,
                do_sample=True,
                top_p=0.92,
                repetition_penalty=1.08,
            )

        generated_tokens = outputs[0][inputs["input_ids"].shape[1]:]
        answer = tokenizer.decode(generated_tokens, skip_special_tokens=True).strip()

        return GenerateResponse(answer=answer)

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


if __name__ == "__main__":
    import uvicorn
    print("\nStarting CodeSense AI server on http://127.0.0.1:8000 ...")
    uvicorn.run(app, host="0.0.0.0", port=8000)