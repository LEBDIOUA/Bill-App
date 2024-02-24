import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
    this.fileAccepted = false
  }

  handleChangeFile = e => {
    e.preventDefault()
    const file = this.document.querySelector(`input[data-testid="file"]`).files[0]
    const fileinput = this.document.querySelector(`input[data-testid="file"]`)
    const fileName = file.name
    const fileAcceptedFormats = ["jpg", "jpeg", "png"]
    const fileFormat = fileName.substr(fileName.lastIndexOf('.')+1, fileName.length-1)
    this.fileAccepted = fileAcceptedFormats.includes(fileFormat)
    if (!this.fileAccepted) {
      console.log(this.fileAccepted, 'if')
      console.log(fileinput.value)
      fileinput.value = "" // Remove file from the input
      fileinput.classList.add("invalid") // Add invalid class to tell user input is invalid
      fileinput.classList.remove("blue-border") // Remove blue-border class
      alert("Le format de votre fichier n'est pas pris en charge." + "\n" + "Seuls les .jpg, .jpeg, .png sont acceptés.") // Error message for user
    } else {
      fileinput.classList.remove("invalid") // Remove invalid class 
      fileinput.classList.add("blue-border") // Add blue-border class
      const formData = new FormData()
      const email = JSON.parse(localStorage.getItem("user")).email
      formData.append('file', file)
      formData.append('email', email)

      this.store
        .bills()
        .create({
          data: formData,
          headers: {
            noContentType: true,
          }
        })
        .then(({filePath, key}) => {
          this.billId = key
          this.fileUrl = filePath
          this.fileName = fileName
        })
    }
  }

  handleSubmit = e => {
    e.preventDefault()
    if(this.fileAccepted) {
      console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
      const email = JSON.parse(localStorage.getItem("user")).email
      const bill = {
        email,
        type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
        name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
        amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
        date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
        vat: e.target.querySelector(`input[data-testid="vat"]`).value,
        pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
        commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
        fileUrl: this.fileUrl,
        fileName: this.fileName,
        status: 'pending'
      }    
      this.updateBill(bill)
      this.onNavigate(ROUTES_PATH['Bills'])
    }
  }

  // not need to cover this function by tests
  /* istanbul ignore next */
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}