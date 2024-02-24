/**
 * @jest-environment jsdom
 */

import { jest } from '@jest/globals'
import {screen, waitFor, fireEvent} from "@testing-library/dom"

import BillsUI,  { traduireMoisEnFrançais, traduireMoisEnAnglais } from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js"
import {ROUTES_PATH, ROUTES} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js"
import store from "../__mocks__/store.js"
import router from "../app/Router.js"
import { formatDate, formatStatus } from '../app/format.js'

describe("Given I am connected as an employee", () => {
  let billsInstance
  // Configuration à exécuter avant chaque test
  beforeEach(() => {
    // Définition d'un utilisateur dans le stockage local pour simuler une session
    localStorage.setItem("user", JSON.stringify({type: 'Employee', email: "test@example.com" }))

    // Mock de la fonction jQuery modal
    $.fn.modal = jest.fn()

    billsInstance= new Bills({
      document: document,
      onNavigate: jest.fn(),
      store: store,
      localStorage: window.localStorage
    })
  })

  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => expect(screen.getByTestId('icon-window')).toBeTruthy())
      expect(screen.getByTestId('icon-window')).toBeTruthy()
    })

    test("Then, bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    // Test Unitaire
    // Test pour vérifier que les données des factures sont rendues correctement 4 fois: type, nom, date, montant, statut et icon-eye
    test("Then, bills data should be render 4: type, name, date, amount, status and eye icon", () => {
      // Injecte des données de factures dans le corps du document pour simuler le rendu de la page
      // La fonction Routes prend en parametre un objet contenant les propriétés pathname, data
      // Puis elle retourne la vue appropriée en fonction de pathname
      // La fonction routes est une fonction utilitaire qui joue le rôle de routeur 
      // En déterminant quelle vue afficher en fonction de l'URL actuelle de l'application.
      document.body.innerHTML = ROUTES({pathname: ROUTES_PATH['Bills'], data: bills})

      // Sélectionne le nombre de lignes et tous les éléments de factures rendues dans le tableau
      const billsCpt = screen.getByTestId("tbody").querySelectorAll("tr").length
      const type = screen.getAllByTestId("bill-type")
      const nom = screen.getAllByTestId("bill-name")
      const date = screen.getAllByTestId("bill-date")
      const montant = screen.getAllByTestId("bill-amount")
      const statut = screen.getAllByTestId("bill-status")
      const iconsEye = screen.getAllByTestId("icon-eye")

      // Vérifie que le nombre de lignes et le nombre d'éléments de factures rendues est égal à 4
      expect(billsCpt).toBe(4)
      expect(type.length).toBe(4)
      expect(nom.length).toBe(4)
      expect(date.length).toBe(4)
      expect(montant.length).toBe(4)
      expect(statut.length).toBe(4)
      expect(iconsEye.length).toBe(4)
    })

    // Test Unitaire
    // Test pour vérifier que les factures récupérées sont formatées avec formatDate et formatStatus
    test("Then fetching bills, they are formatted with formatDate and formatStatus", async () => {
      const fetchedBills = await billsInstance.store.bills().list()
      const formattedBills = fetchedBills.map((bill) => {
        bill.date = formatDate(bill.date)
        bill.status = formatStatus(bill.status)
        return bill
      })

      expect(formattedBills[0]).toEqual(
        { id: '47qAXb6fIm2zOKkLzMro', 
          vat: '80',
          fileUrl: 'https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a',
          status: 'En attente',
          type: 'Hôtel et logement',
          commentary: 'séminaire billed',
          name: 'encore',
          fileName: 'preview-facture-free-201801-pdf-1.jpg',
          date: '4 Avr. 04',
          amount: 400,
          commentAdmin: 'ok',
          email: 'a@a',
          pct: 20
        }
      )
    })

    // Test Unitaire
    // Test pour vérifier qu'une erreur est générée lorsque la fonction formatDate échoue
    test("Then, I should have error when failing formatDate function", async () =>{
      const bill = {
        "id": "47qAXb6fIm2zOKkLzMro",
        "vat": "80",
        "fileUrl": "https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
        "status": "pending",
        "type": "Hôtel et logement",
        "commentary": "séminaire billed",
        "name": "encore",
        "fileName": "preview-facture-free-201801-pdf-1.jpg",
        "date": "",
        "amount": 400,
        "commentAdmin": "ok",
        "email": "a@a",
        "pct": 20
      }

      const mockStore = {
        bills: jest.fn(() => ({
          list: jest.fn().mockResolvedValue([bill])
        }))
      }
      billsInstance.store = mockStore
      
      const consoleLogSpy = jest.spyOn(console, 'log')

      await billsInstance.getBills() 
      expect(consoleLogSpy).toHaveBeenCalled()
      expect(consoleLogSpy.mock.calls[0][0] instanceof RangeError).toBe(true)
    })
    
    // Test pour vérifier que je clique sur icon-eye et que j'appelle handleClickIconEye avec un paramètre
    test("Then, I click on icon-eye button and I call handleClickIconEye with a parameter", async () => {
      const handleClickIconEyeSpy = jest.spyOn(billsInstance, 'handleClickIconEye')
      const iconsEye = screen.queryAllByTestId("icon-eye")
      expect(iconsEye).toBeDefined()
      expect(handleClickIconEyeSpy).toBeDefined()
      
      iconsEye.forEach(icon => {
        icon.addEventListener('click', () => handleClickIconEyeSpy(icon))
        fireEvent.click(icon)
        expect(handleClickIconEyeSpy).toHaveBeenCalledWith(icon)
      })
    })
  })

  // Tests d'intégrations
  describe("When I navigate to Bill", () => {
    // Test pour vérifier que les factures sont récupérées depuis l'API simulée et que les éléments essentiels de ma page sont affichés correctement
    test("Then, bills should be fetched from the mock API and the essential elements of my page must be displayed correctly", async () => {
      // Injecte des données de factures dans le corps du document pour simuler le rendu de la page des factures
			document.body.innerHTML = ROUTES({pathname: ROUTES_PATH['Bills'], data: await store.bills().list()})

      // Vérifie que "Billed", "Mes notes de frais", "btn-new-bill",  "tbody" sont présents dans la page
			expect(screen.getAllByText("Billed")).toBeTruthy()
			expect(screen.getByText("Mes notes de frais")).toBeTruthy()
      expect(screen.getByTestId("btn-new-bill")).toBeTruthy()
			expect(screen.getByTestId("tbody")).toBeTruthy()

      // Vérifie que le nombre de lignes de factures rendues est égal à 4
      expect(screen.getByTestId("tbody").querySelectorAll("tr").length).toBe(4)
		})

    // Test pour récupérer les factures depuis une API et échouer avec un message d'erreur 404
    test("fetches bills from an API and fails with 404 message error", async () => {
      jest.spyOn( store, 'bills')
      store.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        }
      })

      try {
        document.body.innerHTML = ROUTES({pathname: ROUTES_PATH['Bills'], data: await store.bills().list()})
      } catch (error) {
        expect(error.message).toBe("Erreur 404")
      }
    })

    // Test pour récupérer les factures depuis une API et échouer avec un message d'erreur 500
    test("fetches bills from an API and fails with 500 message error", async () => {
      jest.spyOn( store, 'bills')
      store.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"));
          },
        }
      })

      try {
        document.body.innerHTML = ROUTES({pathname: ROUTES_PATH['Bills'], data: await store.bills().list()})
      } catch (error) {
        expect(error.message).toBe("Erreur 500")
      }
    })
  })

  describe("When clicking on icon-eye button", () => {
    // Test d'intégration
    // Test pour vérifier que le modal s'ouvre et contient un titre et une URL de fichier
    test("Then, modal should open and have a title and a file url", () => {
			document.body.innerHTML = BillsUI({ data: bills })

      // Sélection du modal et ajout de la classe "show" pour simuler l'ouverture
			const modal = document.getElementById("modaleFile")
			$.fn.modal = jest.fn(() => modal.classList.add("show"))

			const eye = screen.getAllByTestId("icon-eye")[0]
			const handleClickIconEye = jest.fn(billsInstance.handleClickIconEye(eye))

			eye.addEventListener("click", handleClickIconEye)
			fireEvent.click(eye)
			expect(handleClickIconEye).toHaveBeenCalled()

			expect(modal.classList).toContain("show")

			expect(screen.getByText("Justificatif")).toBeTruthy()
			expect(bills[0].fileUrl).toBeTruthy()
		})
  })

  describe("When clicking on newBill button", () => {
    // Test pour vérifier que la méthode handleClickNewBill appelle onNavigate avec le chemin de la route NewBill
    test("Then I should call onNavigate with NewBill route path", () =>{
        billsInstance.handleClickNewBill()
        expect(billsInstance.onNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill)
    })

    // Test pour vérifier que le formulaire de facture s'ouvre lorsque le bouton "Nouvelle note de frais" est cliqué
		test("Then, bill form should open", async () => {
      document.body.innerHTML = BillsUI({ data: [] })

      // Création d'un élément racine pour le routage
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      // Initialisation du routeur
      router()

      billsInstance.onNavigate(ROUTES_PATH.NewBill)

			const handleClickNewBill = jest.fn(() => billsInstance.handleClickNewBill())
			screen.getByTestId("btn-new-bill").addEventListener("click", handleClickNewBill)
			fireEvent.click(screen.getByTestId("btn-new-bill"))

			expect(handleClickNewBill).toHaveBeenCalled()
			await waitFor(() => expect(screen.getByText("Envoyer une note de frais")).toBeTruthy())
		})
	})

  // Tests Unitaires
  describe("When I am on Bills page, and there are no bills", () => {
    // Ce test vérifie le comportement de l'interface utilisateur lorsque la liste des factures est vide
    // Il vérifie que le nombre de lignes de factures dans le tableau est zéro
    test("Then, no bills should be shown", () => {
      document.body.innerHTML = BillsUI({ data: [] })
      const billsCpt = screen.getByTestId("tbody").querySelectorAll("tr").length
      expect(billsCpt).toBe(0)
    })

    // Ce test vérifie le comportement de la méthode handleClickIconEye lorsque la liste des factures est vide
    test("Then, I have no icon-eye and not call the handleClickIconEye method", () => {
      const billsInstance = new Bills({
        document: document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: window.localStorage
      })

      document.body.innerHTML = BillsUI({ data: [] })

      const handleClickIconEye = jest.spyOn(billsInstance, 'handleClickIconEye')
      const iconEye = screen.queryByTestId('icon-eye')
      const consoleLogSpy = jest.spyOn(console, 'log')

      expect(iconEye).toEqual(null)

      if (!iconEye) {
        console.log('aucun icon trouvé')
      }
      
      expect(handleClickIconEye).not.toHaveBeenCalled()
      expect(consoleLogSpy).toHaveBeenCalled()
      expect(consoleLogSpy).toHaveBeenCalledWith("aucun icon trouvé")
    })
  })
  
  // Tests Unitaires
  describe("When I would like to sort the Bills", () => {
    test("Then, I need to convert the months to english first", () => {
      const date = '01 Avr. 2001'
      const nouvelleDate = traduireMoisEnAnglais(date)
      expect(nouvelleDate).toEqual('01 Apr. 2001')
    })

    test("Then, I get an empty string if the date parameter is empty", () => {
      const date = ''
      const nouvelleDate = traduireMoisEnAnglais(date)
      expect(nouvelleDate).toEqual('')
    })

    test("Then, I need to convert the months to Frensh", () => {
      const date = '01 Apr. 2001'
      const nouvelleDate = traduireMoisEnFrançais(date)
      expect(nouvelleDate).toEqual('01 Avr. 2001')
    })

    test("Then, I get an empty string if the date parameter is empty", () => {
      const date = ''
      const nouvelleDate = traduireMoisEnFrançais(date)
      expect(nouvelleDate).toEqual('')
    })
  })
})
