// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
//var apagaBotao = document.getElementById("deletar");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on the button, open the modal
//btn.onclick = function() {
//  modal.style.display = "block";
//

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
  try {
    document.getElementById('files').remove()
  } catch (error) {
    console.log(error)
  }
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    try {
      document.getElementById('files').remove()
    } catch (error) {
      console.log(error)
    }
  }
}
let tituloModal = document.getElementById('tituloModal')
let corpo = document.getElementById('corpo')
let headerModal = document.getElementById('headerModal')
let footerModal = document.getElementById('footerModal')
function abrirModal(titulo, conteudo, cor='blue') {
  window.scrollTo(0, 0);
  tituloModal.innerHTML = titulo
  corpo.innerHTML = conteudo
  modal.style.display = "block"
  headerModal.style.backgroundColor = cor
  footerModal.style.backgroundColor = cor
}

function fechaModal() {
  modal.style.display = "none";
  try {
    document.getElementById('files').remove()
  } catch (error) {
    console.log(error)
  }
}