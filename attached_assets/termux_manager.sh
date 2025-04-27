
#!/bin/bash

OPTIONS_FILE="termux_custom_options.txt"
DETECTED_COMMANDS="termux_detected_commands.txt"
LOG_FILE="termux_log.txt"

[ ! -f "$OPTIONS_FILE" ] && touch "$OPTIONS_FILE"
[ ! -f "$DETECTED_COMMANDS" ] && touch "$DETECTED_COMMANDS"
[ ! -f "$LOG_FILE" ] && touch "$LOG_FILE"

LAST_RESULT=""

afficher_cadre() {
    echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "📌 $1"
    echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

detecter_commandes() {
    afficher_cadre "🔍 Détection des commandes Ubuntu"
    ls /usr/bin > "$DETECTED_COMMANDS"
    LAST_RESULT="✅ Commandes détectées et enregistrées."
}

afficher_options() {
    afficher_cadre "📂 Liste des commandes disponibles"
    LAST_RESULT="📂 Commandes détectées :\n$(cat -n "$DETECTED_COMMANDS")\n"
    if [ -s "$OPTIONS_FILE" ]; then
        LAST_RESULT+="⭐ Commandes personnalisées :\n$(cat -n "$OPTIONS_FILE")\n"
    else
        LAST_RESULT+="⚠️ Aucune option personnalisée.\n"
    fi
}

executer_par_selection() {
    afficher_options
    read -p "Entrez le numéro de la commande à exécuter : " num_option
    option=$(sed -n "${num_option}p" "$OPTIONS_FILE")
    if [ -z "$option" ]; then
        option=$(sed -n "${num_option}p" "$DETECTED_COMMANDS")
    fi
    if [ -n "$option" ]; then
        read -p "⚠️ Confirmer l'exécution de '$option' ? (o/n) : " confirmation
        if [[ "$confirmation" == "o" || "$confirmation" == "O" ]]; then
            LAST_RESULT="🚀 Exécution de : $option\n$(eval "$option" 2>&1)"
            echo -e "\n📝 $(date) - Commande exécutée : $option" >> "$LOG_FILE"
        else
            LAST_RESULT="❌ Exécution annulée."
        fi
    else
        LAST_RESULT="❌ Numéro invalide."
    fi
}

saisie_manuel() {
    read -p "Entrez la commande à exécuter : " commande
    read -p "Confirmer l'exécution de '$commande' ? (o/n) : " confirmation
    if [[ "$confirmation" == "o" || "$confirmation" == "O" ]]; then
        LAST_RESULT="🚀 Exécution de : $commande\n$(eval "$commande" 2>&1)"
        echo -e "\n📝 $(date) - Commande exécutée : $commande" >> "$LOG_FILE"
    else
        LAST_RESULT="❌ Exécution annulée."
    fi
}

ajouter_option() {
    read -p "Entrez une nouvelle commande à ajouter : " nouvelle_option
    if [ -n "$nouvelle_option" ]; then
        echo "$nouvelle_option" >> "$OPTIONS_FILE"
        LAST_RESULT="✅ Commande ajoutée avec succès."
    else
        LAST_RESULT="❌ Aucune commande ajoutée."
    fi
}

supprimer_option() {
    afficher_options
    read -p "Entrez le numéro de la commande à supprimer : " num_option
    if sed -i "${num_option}d" "$OPTIONS_FILE"; then
        LAST_RESULT="🗑️ Commande supprimée avec succès."
    else
        LAST_RESULT="❌ Erreur lors de la suppression."
    fi
}

afficher_historique() {
    afficher_cadre "📜 Historique des exécutions"
    if [ -s "$LOG_FILE" ]; then
        LAST_RESULT="$(tail -n 10 "$LOG_FILE")"
    else
        LAST_RESULT="⚠️ Aucun historique disponible."
    fi
}

afficher_menu() {
    clear
    echo -e "🛠️ --- MENU PRINCIPAL ---"
    echo "1️⃣  Détecter les commandes Ubuntu"
    echo "2️⃣  Afficher toutes les options disponibles"
    echo "3️⃣  Sélectionner et exécuter une commande"
    echo "4️⃣  Saisir manuellement une commande"
    echo "5️⃣  Ajouter une commande personnalisée"
    echo "6️⃣  Supprimer une commande personnalisée"
    echo "7️⃣  Afficher l'historique des commandes"
    echo "8️⃣  Quitter"
    echo -e "\n📌 --- RÉSULTAT ---"
    echo -e "$LAST_RESULT" | less -R
}

while true; do
    afficher_menu
    read -p "👉 Choisissez une option : " choix
    case $choix in
        1) detecter_commandes ;;
        2) afficher_options ;;
        3) executer_par_selection ;;
        4) saisie_manuel ;;
        5) ajouter_option ;;
        6) supprimer_option ;;
        7) afficher_historique ;;
        8) echo "👋 Bye !"; exit 0 ;;
        *) LAST_RESULT="❌ Option invalide !" ;;
    esac
done
