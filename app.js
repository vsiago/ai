// Defina os elementos HTML
const video = document.getElementById('webcam');
const canvas = document.getElementById('output');
const ctx = canvas.getContext('2d');

// Função principal
async function runObjectDetection() {
    // Acessar a câmera do dispositivo
    const stream = await navigator.mediaDevices.getUserMedia({ 'video': true });
    video.srcObject = stream;

    // Carregar o modelo COCO-SSD
    const model = await cocoSsd.load();

    // Realizar detecção de objetos em um loop
    async function detectFrame() {
        const predictions = await model.detect(video);
        
        // Limpar o canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Desenhar as caixas delimitadoras e rótulos
        predictions.forEach(prediction => {
            ctx.beginPath();
            ctx.rect(prediction.bbox[0], prediction.bbox[1], prediction.bbox[2], prediction.bbox[3]);
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.fillStyle = 'red';
            ctx.font = '18px Arial';
            ctx.fillText(`${prediction.class} (${Math.round(prediction.score * 100)}%)`, prediction.bbox[0], prediction.bbox[1] > 10 ? prediction.bbox[1] - 5 : 10);
            ctx.stroke();
        });

        // Continuar o loop
        requestAnimationFrame(detectFrame);
    }

    // Iniciar o loop de detecção
    detectFrame();
}

// Iniciar a detecção de objetos quando a página estiver carregada
document.addEventListener('DOMContentLoaded', runObjectDetection);
