import VerticalLayout from './VerticalLayout.js'
import ErrorPage from "./ErrorPage.js"
import LoadingPage from "./LoadingPage.js"

import Actions from './Actions.js'

const row = (bill) => {
  return (`
    <tr>
      <td data-testid="bill-type">${bill.type}</td>
      <td data-testid="bill-name">${bill.name}</td>
      <td data-testid="bill-date">${bill.date}</td>
      <td data-testid="bill-amount">${bill.amount} €</td>
      <td data-testid="bill-status">${bill.status}</td>
      <td>
        ${Actions(bill.fileUrl, bill.fileName)}
      </td>
    </tr>
    `)
}

const rows = (data) => {
  return (data && data.length) 
    ? data
      .map(bill => {bill.date = traduireMoisEnAnglais(bill.date)
                    return bill
                  })
      .sort((a, b) => (new Date(b.date) - new Date(a.date)))
      .map(bill => {bill.date = traduireMoisEnFrançais(bill.date)
                    return row(bill)
                })
      .join("") 

    : ""
}

export const traduireMoisEnAnglais = (date) => {
  if(!date) {
    return ""
  }
  let dateArray = date.split(' ')
  if(dateArray[1]){
    const moisEnAnglais = {
      'Jan.': 'Jan.',
      'Fév.': 'Feb.',
      'Mar.': 'Mar.',
      'Avr.': 'Apr.',
      'Mai.': 'May.',
      'Jun.': 'Jun.',
      'Jul.': 'Jul.',
      'Aoû.': 'Aug.',
      'Sep.': 'Sep.',
      'Oct.': 'Oct.',
      'Nov.': 'Nov.',
      'Déc.': 'Dec.'
    }
    dateArray[1] = moisEnAnglais[dateArray[1].replace(dateArray[1][0], dateArray[1][0].toUpperCase())]
  }
  return dateArray.join(' ')
}

export const traduireMoisEnFrançais = (date) => {
  if(!date) {
    return ""
  }
  let dateArray = date.split(' ')
  if(dateArray[1]){
    const moisEnFrançais = {
      'Jan.': 'Jan.',
      'Feb.': 'Fév.',
      'Mar.': 'Mar.',
      'Apr.': 'Avr.',
      'May.': 'Mai.',
      'Jun.': 'Jun.',
      'Jul.': 'Jul.',
      'Aug.': 'Aoû.',
      'Sep.': 'Sep.',
      'Oct.': 'Oct.',
      'Nov.': 'Nov.',
      'Dec.': 'Déc.'
      }
    dateArray[1] = moisEnFrançais[dateArray[1]]
  }
  return dateArray.join(' ')
}

export default ({ data: bills, loading, error }) => {
  
  const modal = () => (`
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `)

  if (loading) {
    return LoadingPage()
  } else if (error) {
    return ErrorPage(error)
  }
  
  return (`
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr>
                <th>Type</th>
                <th>Nom</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      <div data-testid="modal-container">
        ${modal()}
      </div>
    </div>`
  )
}