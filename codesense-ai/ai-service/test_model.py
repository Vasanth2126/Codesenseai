import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from peft import PeftModel

BASE_MODEL = "Qwen/Qwen2.5-Coder-1.5B-Instruct"
ADAPTER_PATH = "./codesenseai_finetuned"

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

print("\nLoading base Qwen model...")

model = AutoModelForCausalLM.from_pretrained(
    BASE_MODEL,
    torch_dtype=torch.float16,
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

print("LoRA adapter loaded successfully.")

model.eval()

print("\nModel device:", model.device)

prompt = """<|im_start|>system
You are CodeSense AI, an assistant that helps developers understand their code.<|im_end|>
<|im_start|>user
What is a Python function?<|im_end|>
<|im_start|>assistant
"""

inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

print("\nGenerating response...")

with torch.no_grad():
    outputs = model.generate(
        **inputs,
        max_new_tokens=100,
        temperature=0.2,
        do_sample=True
    )

response = tokenizer.decode(
    outputs[0][inputs["input_ids"].shape[1]:],
    skip_special_tokens=True
)

print("\n========== MODEL RESPONSE ==========")
print(response)
print("====================================")