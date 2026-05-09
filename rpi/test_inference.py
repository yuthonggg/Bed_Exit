import sys
import logging
import inference

# Set up logging to show the output clearly in the terminal
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')

if __name__ == "__main__":
    # Check if the user provided an image path
    if len(sys.argv) < 2:
        print("Usage: python test_inference.py <path_to_image.jpg>")
        sys.exit(1)
        
    image_path = sys.argv[1]
    
    print(f"\n[CAMERA] Analyzing image: {image_path}...\n")
    
    # Run the exact inference logic from inference.py
    result = inference.run_inference(image_path)
    
    print("\n" + "="*30)
    print("[XIAOMI DECISION]")
    print("="*30)
    print(f"Classification: {result['classification'].upper()}")
    print(f"Confidence:     {result['confidence']}")
    print("="*30 + "\n")
