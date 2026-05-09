import base64
import logging
from openai import OpenAI
import config

# Configure the Xiaomi API client (OpenAI-compatible)
client = OpenAI(
    api_key=config.XIAOMI_API_KEY,
    base_url=config.XIAOMI_BASE_URL
)

import io
import PIL.Image

def encode_image(image_path: str) -> str:
    """Encode the image to base64, ensuring it is a JPEG since some APIs reject WEBP."""
    img = PIL.Image.open(image_path)
    if img.mode != 'RGB':
        img = img.convert('RGB')
    
    buffer = io.BytesIO()
    img.save(buffer, format="JPEG")
    return base64.b64encode(buffer.getvalue()).decode('utf-8')

def run_inference(image_path: str) -> dict:
    """
    Uses Xiaomi MiMo Multimodal API to classify the image.
    """
    try:
        base64_image = encode_image(image_path)
        prompt = "You are a hospital safety monitor. Is this person unsafely exiting their bed? Answer with EXACTLY ONLY one word: unsafe_exit, safe_exit, or repositioning."
        
        response = client.chat.completions.create(
            model="mimo-v2.5", # Xiaomi's multimodal vision model
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{base64_image}"
                            }
                        }
                    ]
                }
            ],
            max_tokens=500
        )
        
        logging.info(f"FULL XIAOMI RESPONSE OBJECT: {response}")
        result_text = response.choices[0].message.content or ""
        result_text = result_text.strip().lower()
        logging.info(f"Xiaomi text response: '{result_text}'")
        
        if "unsafe_exit" in result_text:
            classification = "unsafe_exit"
        elif "safe_exit" in result_text:
            classification = "safe_exit"
        elif "repositioning" in result_text:
            classification = "repositioning"
        else:
            classification = "inconclusive"
            
        return {
            "classification": classification,
            "confidence": 0.99
        }
        
    except Exception as e:
        logging.error(f"Xiaomi Inference failed: {e}")
        
    return {"classification": "inconclusive", "confidence": 0.0}
