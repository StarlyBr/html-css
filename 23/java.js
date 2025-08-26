const form = document.getElementById('contato-form');
const mensagem = document.getElementById('mensagem');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    mensagem.textContent = "Mensagem enviada com sucesso! Obrigado.";
    form.reset();
});
