from google import genai
import logging
import PIL.Image
import config

# Configure the Gemini client
client = genai.Client(api_key=config.GEMINI_API_KEY)

def run_inference(image_path: str) -> dict:
    """
    Uses Google Gemini 2.0 Flash to classify the image.
    """
    try:
        img = PIL.Image.open(image_path)
        
        prompt = "You are a hospital safety monitor. Is this person unsafely exiting their bed? Answer with EXACTLY ONLY one word: unsafe_exit, safe_exit, or repositioning."
        
        response = client.models.generate_content(
            model='gemini-2.0-flash-lite',
            contents=[prompt, img]
        )
        
        result_text = response.text.strip().lower()
        logging.info(f"Gemini raw response: {result_text}")
        
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
        logging.error(f"Gemini Inference failed: {e}")
        
    return {"classification": "inconclusive", "confidence": 0.0}
