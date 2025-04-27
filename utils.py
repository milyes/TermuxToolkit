import os
import subprocess
import logging
from typing import List, Tuple

def detect_commands(output_file: str) -> None:
    """
    Detect Ubuntu commands from /usr/bin and save to file.
    
    Args:
        output_file: Path to file where commands will be saved
    """
    try:
        # Get all files in /usr/bin
        result = subprocess.run(
            ["ls", "/usr/bin"], 
            capture_output=True, 
            text=True, 
            check=True
        )
        
        # Write the output to file
        with open(output_file, 'w') as f:
            f.write(result.stdout)
            
    except subprocess.CalledProcessError as e:
        logging.error(f"Command detection failed: {e}")
        raise Exception(f"Échec de la détection des commandes: {e}")
    except Exception as e:
        logging.error(f"Error in detect_commands: {e}")
        raise

def execute_command(command: str) -> str:
    """
    Execute a shell command safely and return its output.
    
    Args:
        command: The command to execute
        
    Returns:
        The command output (stdout and stderr)
    """
    try:
        # Execute the command and capture output
        process = subprocess.run(
            command,
            shell=True,  # Use shell for command parsing
            capture_output=True,
            text=True,
            timeout=60  # Timeout after 60 seconds
        )
        
        # Combine stdout and stderr
        output = process.stdout
        if process.stderr:
            output += "\n" + process.stderr
            
        return output
    except subprocess.TimeoutExpired:
        return "❌ Timeout: La commande a pris trop de temps à s'exécuter."
    except subprocess.CalledProcessError as e:
        return f"❌ Erreur d'exécution (code {e.returncode}): {e.stderr}"
    except Exception as e:
        logging.error(f"Error executing command: {e}")
        return f"❌ Erreur: {str(e)}"

def get_detected_commands(file_path: str) -> List[str]:
    """
    Read and return the detected commands from file.
    
    Args:
        file_path: Path to the file containing detected commands
        
    Returns:
        List of detected commands
    """
    if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
        with open(file_path, 'r') as f:
            return [line.strip() for line in f.readlines() if line.strip()]
    return []

def get_custom_commands(file_path: str) -> List[str]:
    """
    Read and return the custom commands from file.
    
    Args:
        file_path: Path to the file containing custom commands
        
    Returns:
        List of custom commands
    """
    if os.path.exists(file_path) and os.path.getsize(file_path) > 0:
        with open(file_path, 'r') as f:
            return [line.strip() for line in f.readlines() if line.strip()]
    return []
