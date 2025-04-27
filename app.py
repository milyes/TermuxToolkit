import os
import logging
from datetime import datetime
from flask import Flask, render_template, request, jsonify, session
from utils import detect_commands, execute_command, get_detected_commands, get_custom_commands

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev_secret_key")

# File paths for storing data
OPTIONS_FILE = "termux_custom_options.txt"
DETECTED_COMMANDS = "termux_detected_commands.txt"
LOG_FILE = "termux_log.txt"

# Initialize files if they don't exist
for file_path in [OPTIONS_FILE, DETECTED_COMMANDS, LOG_FILE]:
    if not os.path.exists(file_path):
        with open(file_path, 'w') as f:
            pass

@app.route('/')
def index():
    """Render the main application page."""
    return render_template('index.html')

@app.route('/detect_commands', methods=['POST'])
def detect_ubuntu_commands():
    """Detect Ubuntu commands and save them to file."""
    try:
        detect_commands(DETECTED_COMMANDS)
        return jsonify({
            'status': 'success',
            'message': '✅ Commandes détectées et enregistrées.'
        })
    except Exception as e:
        logging.error(f"Error detecting commands: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'❌ Erreur lors de la détection des commandes: {str(e)}'
        })

@app.route('/get_commands', methods=['GET'])
def get_commands():
    """Get detected and custom commands."""
    try:
        detected = get_detected_commands(DETECTED_COMMANDS)
        custom = get_custom_commands(OPTIONS_FILE)
        
        return jsonify({
            'status': 'success',
            'detected': detected,
            'custom': custom
        })
    except Exception as e:
        logging.error(f"Error getting commands: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'❌ Erreur lors de la récupération des commandes: {str(e)}'
        })

@app.route('/execute_command', methods=['POST'])
def run_command():
    """Execute a command and log it."""
    data = request.json
    command = data.get('command', '')
    
    if not command:
        return jsonify({
            'status': 'error',
            'message': '❌ Aucune commande fournie.'
        })
    
    try:
        # Execute the command
        output = execute_command(command)
        
        # Log the execution
        with open(LOG_FILE, 'a') as log:
            log.write(f"\n📝 {datetime.now()} - Commande exécutée : {command}")
        
        return jsonify({
            'status': 'success',
            'message': f'🚀 Exécution de : {command}',
            'output': output
        })
    except Exception as e:
        logging.error(f"Error executing command '{command}': {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'❌ Erreur lors de l\'exécution: {str(e)}'
        })

@app.route('/add_custom_command', methods=['POST'])
def add_custom_command():
    """Add a custom command to the options file."""
    data = request.json
    command = data.get('command', '')
    
    if not command:
        return jsonify({
            'status': 'error',
            'message': '❌ Aucune commande fournie.'
        })
    
    try:
        with open(OPTIONS_FILE, 'a') as f:
            f.write(f"{command}\n")
        
        return jsonify({
            'status': 'success',
            'message': '✅ Commande ajoutée avec succès.'
        })
    except Exception as e:
        logging.error(f"Error adding custom command: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'❌ Erreur lors de l\'ajout de la commande: {str(e)}'
        })

@app.route('/delete_custom_command', methods=['POST'])
def delete_custom_command():
    """Delete a custom command from the options file."""
    data = request.json
    index = data.get('index')
    
    if index is None:
        return jsonify({
            'status': 'error',
            'message': '❌ Aucun index fourni.'
        })
    
    try:
        with open(OPTIONS_FILE, 'r') as f:
            lines = f.readlines()
        
        if 0 <= index < len(lines):
            del lines[index]
            
            with open(OPTIONS_FILE, 'w') as f:
                f.writelines(lines)
            
            return jsonify({
                'status': 'success',
                'message': '🗑️ Commande supprimée avec succès.'
            })
        else:
            return jsonify({
                'status': 'error',
                'message': '❌ Index invalide.'
            })
    except Exception as e:
        logging.error(f"Error deleting custom command: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'❌ Erreur lors de la suppression: {str(e)}'
        })

@app.route('/get_history', methods=['GET'])
def get_history():
    """Get command execution history."""
    try:
        if os.path.exists(LOG_FILE) and os.path.getsize(LOG_FILE) > 0:
            with open(LOG_FILE, 'r') as f:
                # Get the last 10 lines
                lines = f.readlines()
                history = lines[-10:] if len(lines) > 10 else lines
            
            return jsonify({
                'status': 'success',
                'history': history
            })
        else:
            return jsonify({
                'status': 'success',
                'history': [],
                'message': '⚠️ Aucun historique disponible.'
            })
    except Exception as e:
        logging.error(f"Error getting history: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': f'❌ Erreur lors de la récupération de l\'historique: {str(e)}'
        })

# Error handlers
@app.errorhandler(404)
def page_not_found(e):
    return render_template('index.html'), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({
        'status': 'error',
        'message': '❌ Erreur serveur interne.'
    }), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
