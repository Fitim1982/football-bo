/**
 * MASTER ENGINE - TYPESCRIPT VERSION
 * Diese Datei spiegelt die Logik der Python master_engine wider.
 */

// Hilfsfunktion: Fakultät
const factorial = (n: number): number => {
    if (n === 0 || n === 1) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
};

// Poisson Wahrscheinlichkeitsmasse-Funktion
const poissonPMF = (k: number, lambda: number): number => {
    return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial(k);
};

// Hauptfunktion für die Markt-Berechnung
export const calculateOmniMarkets = (lh: number, la: number, rho: number, hcVal: number = 0) => {
    const size = 10; // 10x10 Matrix für hohe Präzision
    const matrix: number[][] = Array.from({ length: size }, () => Array(size).fill(0));
    let totalSum = 0;

    // 1. Matrix generieren mit Dixon-Coles Korrektur
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            let p = poissonPMF(i, lh) * poissonPMF(j, la);
            
            // Dixon-Coles Korrektur-Faktor (tau)
            let tau = 1.0;
            if (i === 0 && j === 0) tau = 1 - lh * la * rho;
            else if (i === 0 && j === 1) tau = 1 + lh * rho;
            else if (i === 1 && j === 0) tau = 1 + la * rho;
            else if (i === 1 && j === 1) tau = 1 - rho;
            
            matrix[i][j] = p * Math.max(tau, 1e-10);
            totalSum += matrix[i][j];
        }
    }

    // 2. Renormierung (Summe muss 1.0 ergeben)
    const prob = (i: number, j: number) => matrix[i][j] / totalSum;

    // 3. Markt-Extraktion
    let ft1 = 0, ftx = 0, ft2 = 0, fto25 = 0, ahH = 0, ahA = 0;
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const p = prob(i, j);
            
            // 1X2 Märkte
            if (i > j) ft1 += p;
            else if (i === j) ftx += p;
            else if (i < j) ft2 += p;
            
            // Over/Under 2.5
            if (i + j > 2.5) fto25 += p;
            
            // Asian Handicap Logik (mit Halbe-Punkte-Push-Verarbeitung)
            const scoreDiff = i - j + hcVal;
            if (scoreDiff > 0) {
                ahH += p;
            } else if (scoreDiff < 0) {
                ahA += p;
            } else {
                // Bei exaktem Gleichstand (Push) wird das Kapital geteilt (Modell-Sicht)
                ahH += p * 0.5;
                ahA += p * 0.5;
            }
        }
    }

    return { 
        FT_1: ft1, 
        FT_X: ftx, 
        FT_2: ft2, 
        FT_O25: fto25, 
        FT_U25: 1 - fto25,
        FT_AH_H: ahH, 
        FT_AH_A: ahA 
    };
};