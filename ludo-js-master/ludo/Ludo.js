import { BASE_POSITIONS, HOME_ENTRANCE, HOME_POSITIONS, PLAYERS, SAFE_POSITIONS, START_POSITIONS, STATE, TURNING_POINTS } from './constants.js';
import { UI } from './UI.js';

export class Ludo { // Classe principale pour le jeu Ludo
    currentPositions = {
        P1: [],
        P2: []
    }

    _diceValue;
    get diceValue() {// Méthode getter pour obtenir la valeur du dé
        return this._diceValue;
    }
    set diceValue(value) { // Méthode setter pour définir la valeur du dé
        this._diceValue = value;

        UI.setDiceValue(value); // Mettre à jour l'interface utilisateur avec la valeur du dé
    }

    _turn;
    get turn() { // Méthode getter pour obtenir le tour
        return this._turn;
    }
    set turn(value) { // Méthode setter pour définir le tour
        this._turn = value;
        UI.setTurn(value); // Mettre à jour l'interface utilisateur avec le tour
    }

    _state;
    get state() { // Méthode getter pour obtenir l'état du jeu
        return this._state;
    }
    set state(value) { //  Méthode setter pour définir l'état du jeu
        this._state = value;

        if(value === STATE.DICE_NOT_ROLLED) { // Si l'état est DICE_NOT_ROLLED, activer le dé
            UI.enableDice(); // Activer le dé
            UI.unhighlightPieces(); // Désactiver les pièces mises en surbrillance
        } else {
            UI.disableDice(); // Désactiver le dé
        }
    }
    // Constructeur de la classe Ludo
    constructor() {
        console.log('Hello World! Lets play Ludo!');

        // this.diceValue = 4;
        // this.turn = 0;
        // this.state = STATE.DICE_ROLLED;
        this.listenDiceClick(); // Écouteur d'événement pour le clic sur le dé
        this.listenResetClick();// Écouteur d'événement pour le clic sur le bouton de réinitialisation
        this.listenPieceClick();// Écouteur d'événement pour le clic sur une pièce

        this.resetGame();
        // this.setPiecePosition('P1', 0, 0);
        // this.setPiecePosition('P2', 0, 1);
        // this.diceValue = 6;
        // console.log(this.getEligiblePieces('P1'))
        
    }
    // Méthode pour écouter l'événement de clic sur le dé
    listenDiceClick() {
        UI.listenDiceClick(this.onDiceClick.bind(this))// Écouteur d'événement pour le clic sur le dé
    }
    // Méthode pour gérer l'événement de clic sur le dé
    onDiceClick() {
        console.log('dice clicked!');
        this.diceValue = 1 + Math.floor(Math.random() * 6); // Générer un nombre aléatoire entre 1 et 6
        this.state = STATE.DICE_ROLLED;    // Définir l'état du jeu sur DICE_ROLLED
        
        this.checkForEligiblePieces(); // Vérifier les pièces éligibles pour le joueur actuel
    }
    // Méthode pour vérifier les pièces éligibles pour le joueur actuel
    checkForEligiblePieces() {
        const player = PLAYERS[this.turn];// Obtenir le joueur actuel
        // eligible pieces of given player
        const eligiblePieces = this.getEligiblePieces(player); // Obtenir les pièces éligibles pour le joueur actuel
        if(eligiblePieces.length) {
            // highlight the pieces
            UI.highlightPieces(player, eligiblePieces);
        } else {
            this.incrementTurn(); // Incrémenter le tour
        }
    }

    incrementTurn() {
        this.turn = this.turn === 0 ? 1 : 0;// Incrémenter le tour
        this.state = STATE.DICE_NOT_ROLLED;
    }

    getEligiblePieces(player) {
        return [0, 1, 2, 3].filter(piece => {
            const currentPosition = this.currentPositions[player][piece];

            if(currentPosition === HOME_POSITIONS[player]) { 
                return false;
            }

            if(
                BASE_POSITIONS[player].includes(currentPosition) // Si la position actuelle est dans les positions de base 
                && this.diceValue !== 6 // et la valeur du dé n'est pas 6
            ){
                return false;
            }

            if(
                HOME_ENTRANCE[player].includes(currentPosition) // Si la position actuelle est dans les positions d'entrée à domicile
                && this.diceValue > HOME_POSITIONS[player] - currentPosition // et la valeur du dé est supérieure à la distance restante pour atteindre la position de la maison
                ) {
                return false;
            }

            return true;
        });
    }

    listenResetClick() {
        UI.listenResetClick(this.resetGame.bind(this)) // Écouteur d'événement pour le clic sur le bouton de réinitialisation
    }

    resetGame() {
        console.log('reset game');
        this.currentPositions = structuredClone(BASE_POSITIONS);// Réinitialiser les positions actuelles

        PLAYERS.forEach(player => { // Réinitialiser les positions des pièces pour chaque joueur
            [0, 1, 2, 3].forEach(piece => {
                this.setPiecePosition(player, piece, this.currentPositions[player][piece]) // Définir la position de la pièce
            })
        });

        this.turn = 0;
        this.state = STATE.DICE_NOT_ROLLED;
    }

    listenPieceClick() {
        UI.listenPieceClick(this.onPieceClick.bind(this)); 
    }

    onPieceClick(event) {
        const target = event.target;

        if(!target.classList.contains('player-piece') || !target.classList.contains('highlight')) { // Vérifier si la cible est une pièce de joueur et est mise en surbrillance
            return;
        }
        console.log('piece clicked')

        const player = target.getAttribute('player-id'); // Obtenir l'ID du joueur
        const piece = target.getAttribute('piece'); // Obtenir la pièce
        this.handlePieceClick(player, piece); // Gérer le clic sur la pièce
    }
    // Écouteur d'événement pour le clic sur une pièce
    listenPieceClick() {
        UI.listenPieceClick(this.onPieceClick.bind(this));
    }

    // Gestionnaire d'événement pour le clic sur une pièce
    onPieceClick(event) {
        const target = event.target; // Obtenir la cible de l'événement

        // Vérifie si la cible est une pièce de joueur et est mise en surbrillance
        if(!target.classList.contains('player-piece') || !target.classList.contains('highlight')) {
            return;
        }
        console.log('pièce cliquée');

        const player = target.getAttribute('player-id'); 
        const piece = target.getAttribute('piece');
        this.handlePieceClick(player, piece);
    }
    handlePieceClick(player, piece) {
        console.log(player, piece);
        const currentPosition = this.currentPositions[player][piece];
        
        if(BASE_POSITIONS[player].includes(currentPosition)) {
            this.setPiecePosition(player, piece, START_POSITIONS[player]);
            this.state = STATE.DICE_NOT_ROLLED;
            return;
        }

        UI.unhighlightPieces();
        this.movePiece(player, piece, this.diceValue);
    }

    setPiecePosition(player, piece, newPosition) {
        this.currentPositions[player][piece] = newPosition;
        UI.setPiecePosition(player, piece, newPosition)
    }

    movePiece(player, piece, moveBy) {
        // this.setPiecePosition(player, piece, this.currentPositions[player][piece] + moveBy)
        const interval = setInterval(() => { // Déplacer la pièce à l'aide de l'intervalle
            this.incrementPiecePosition(player, piece);
            moveBy--;

            if(moveBy === 0) { // Si le déplacement est terminé
                clearInterval(interval);

                // check if player won
                if(this.hasPlayerWon(player)) {
                    alert(`Player: ${player} has won!`);
                    this.resetGame();
                    return;
                }

                const isKill = this.checkForKill(player, piece);

                if(isKill || this.diceValue === 6) {
                    this.state = STATE.DICE_NOT_ROLLED;
                    return;
                }

                this.incrementTurn();
            }
        }, 200);
    }

    checkForKill(player, piece) { // Vérifier si une pièce peut être tuée
        const currentPosition = this.currentPositions[player][piece];
        const opponent = player === 'P1' ? 'P2' : 'P1';

        let kill = false;

        [0, 1, 2, 3].forEach(piece => {
            const opponentPosition = this.currentPositions[opponent][piece]; 

            if(currentPosition === opponentPosition && !SAFE_POSITIONS.includes(currentPosition)) { // Si la position actuelle est la même que celle de l'adversaire et n'est pas une position sûre
                this.setPiecePosition(opponent, piece, BASE_POSITIONS[opponent][piece]); // Définir la position de l'adversaire sur la position de base
                kill = true
            }
        });

        return kill 
    }

    hasPlayerWon(player) {
        return [0, 1, 2, 3].every(piece => this.currentPositions[player][piece] === HOME_POSITIONS[player])
    }

    incrementPiecePosition(player, piece) {
        this.setPiecePosition(player, piece, this.getIncrementedPosition(player, piece));
    }
    
    getIncrementedPosition(player, piece) {
        const currentPosition = this.currentPositions[player][piece];

        if(currentPosition === TURNING_POINTS[player]) {
            return HOME_ENTRANCE[player][0]; // Retourner la première position d'entrée à domicile
        }
        else if(currentPosition === 51) { // Si la position actuelle est 51
            return 0;
        }
        return currentPosition + 1;
    }
}