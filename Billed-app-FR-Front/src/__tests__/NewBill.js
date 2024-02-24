/**
 * @jest-environment jsdom
 */
import {expect, jest, test} from '@jest/globals'
import {screen, fireEvent} from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import store from "../__mocks__/store.js"
import { ROUTES_PATH} from "../constants/routes.js"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    let newBillInstance
    // Configuration à exécuter avant chaque test
    beforeEach(() => {
      // Définition d'un utilisateur dans le stockage local pour simuler une session
      localStorage.setItem("user", JSON.stringify({ email: "test@example.com" }))
      // Initialisation de la structure de la page avec le composant NewBillUI
      document.body.innerHTML = NewBillUI()
      
      newBillInstance= new NewBill({
        document: document,
        onNavigate: jest.fn(),
        store: store,
        localStorage: window.localStorage,
      })
    })

    // Test pour vérifier que la fonction handleSubmit est appelée lorsque le bouton est cliqué
    test("Then I should call handleSubmit when I click on the button", () => {      
      const formNewBill = screen.getByTestId("form-new-bill")
      const handleSubmitSpy = jest.fn((e) => newBillInstance.handleSubmit(e))

      formNewBill.addEventListener("submit", handleSubmitSpy)
      fireEvent.submit(formNewBill)
      expect(handleSubmitSpy).toHaveBeenCalled()
    })

    // Test pour vérifier que l'application accepte les fichiers jpg, jpeg et png
    test("Then I should accepted three types of files jpg, jpeg, png", async () => {
      // Configuration de l'instance newBillInstance pour simuler la création d'une facture
      newBillInstance.store = {
        bills: jest.fn(() => ({
          create: jest.fn().mockResolvedValue({
            filePath: 'file/path',
            key: 'file_key'
          })
        }))
      }

      const inputFile = screen.getByTestId("file")
      
      const filePng = new File(["content"], "fileName.png")
      const fileJpg = new File(["content"], "fileName.jpg")
      const fileJpeg = new File(["content"], "fileName.jpeg")

      const handleChangeFileSpy = jest.spyOn(newBillInstance, 'handleChangeFile') 
      inputFile.addEventListener("change", handleChangeFileSpy)

      fireEvent.change(inputFile, { target: { files: [filePng] } })
      await Promise.resolve()
      expect(handleChangeFileSpy).toHaveBeenCalled()
      expect(newBillInstance.fileUrl).toBe('file/path')
      expect(newBillInstance.fileName).toBe('fileName.png')

      fireEvent.change(inputFile, { target: { files: [fileJpg] } })
      await Promise.resolve()
      expect(handleChangeFileSpy).toHaveBeenCalled()
      expect(newBillInstance.fileUrl).toBe('file/path')
      expect(newBillInstance.fileName).toBe('fileName.jpg')

      fireEvent.change(inputFile, { target: { files: [fileJpeg] } })
      await Promise.resolve()
      expect(handleChangeFileSpy).toHaveBeenCalled()
      expect(newBillInstance.fileUrl).toBe('file/path')
      expect(newBillInstance.fileName).toBe('fileName.jpeg')
    })

    // Test pour vérifier qu'un message d'erreur est affiché lorsque l'utilisateur choisit un fichier invalide
    test("Then I should have an error message when I choice a refused file", async () => {
      const alertSpy = jest.spyOn(window, "alert")

      const inputFile = screen.getByTestId("file")
      const fileNoAccepted = new File(["content"], "fileName.txt")

      const handleChangeFileSpy = jest.spyOn(newBillInstance, 'handleChangeFile') 
      inputFile.addEventListener("change", handleChangeFileSpy)
      
      fireEvent.change(inputFile, { target: { files: [fileNoAccepted] } })
      await Promise.resolve()
      expect(alertSpy).toHaveBeenCalledWith("Le format de votre fichier n'est pas pris en charge." + "\n" + "Seuls les .jpg, .jpeg, .png sont acceptés.")
    })

    // Test d'intégration POST
    // Ce test vérifie le comportement d'ajout d'une nouvelle facture
    // En utilisant une requête POST simulée vers une API fictive (mock API)
    test("Then, I add a bill from mock API POST", async () => {
      // Crée un espion pour la méthode `bills` de l'objet `mockStore`
			const billsMock = jest.spyOn(store, "bills")

      // Définit un objet représentant une nouvelle facture à ajouter
			const bill = {
				id: "47qAXb6fIm2zOKkLzMro",
				vat: "80",
				fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
				status: "pending",
				type: "Hôtel et logement",
				commentary: "séminaire billed",
				name: "encore",
				fileName: "preview-facture-free-201801-pdf-1.jpg",
				date: "2004-04-04",
				amount: 400,
				commentAdmin: "ok",
				email: "a@a",
				pct: 20,
			}
      // Appelle la méthode `update` de l'objet `bills` du `mockStore` avec la nouvelle facture
			const postBills = await store.bills().update(bill)

      // Vérifie que la méthode `bills` de l'objet `mockStore` a été appelée exactement une fois
			expect(billsMock).toHaveBeenCalledTimes(1)
      
      // Vérifie que la facture renvoyée par la méthode `update` est identique à la facture ajoutée
			expect(postBills).toStrictEqual(bill)
		})

    // Test pour vérifier que l'ajout de factures à partir d'une API échoue avec un message d'erreur 404
    test("Then, I add bills from an API and fails with 404 message error", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error")
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          querySelector: jest.fn().mockImplementation((selector) => {
            switch (selector) {
              case 'input[data-testid="datepicker"]':
                return { value: '2001-01-01' }
              case 'select[data-testid="expense-type"]':
                return { value: 'Hôtel et logement' }
              case 'input[data-testid="expense-name"]':
                return { value: 'encore' }
              case 'input[data-testid="amount"]':
                return { value: '400' }
              case 'input[data-testid="vat"]':
                return { value: '80' }
              case 'textarea[data-testid="commentary"]':
                return { value: 'séminaire billed' }
              case 'input[data-testid="pct"]':
                return { value: '20' }
              default:
                return null
            }
          }),
        }
      }
      const store = {
        bills: jest.fn(() => store),
        update: jest.fn(() => Promise.reject(new Error("404"))),
      }
      newBillInstance.store = store
      newBillInstance.fileAccepted = true
      
      const form = screen.getByTestId("form-new-bill") 
      const handleSubmit = jest.fn(newBillInstance.handleSubmit(mockEvent)) 
      
      form.addEventListener("submit", handleSubmit())

      fireEvent.submit(form)
      await new Promise(process.nextTick)
      
      expect(consoleErrorSpy).toBeCalledWith(new Error("404"))
    })

    // Test pour vérifier que l'ajout de factures à partir d'une API échoue avec un message d'erreur 500
    test("Then, I add bills from an API and fails with 500 message error", async () => {
      const consoleErrorSpy = jest.spyOn(console, "error")
      const mockEvent = {
        preventDefault: jest.fn(),
        target: {
          querySelector: jest.fn().mockImplementation((selector) => {
            switch (selector) {
              case 'input[data-testid="datepicker"]':
                return { value: '2001-01-01' }
              case 'select[data-testid="expense-type"]':
                return { value: 'Hôtel et logement' }
              case 'input[data-testid="expense-name"]':
                return { value: 'encore' }
              case 'input[data-testid="amount"]':
                return { value: '400' }
              case 'input[data-testid="vat"]':
                return { value: '80' }
              case 'textarea[data-testid="commentary"]':
                return { value: 'séminaire billed' }
              case 'input[data-testid="pct"]':
                return { value: '20' }
              default:
                return null
            }
          }),
        }
      }
      const store = {
        bills: jest.fn(() => store),
        update: jest.fn(() => Promise.reject(new Error("500"))),
      }

      newBillInstance.store = store
      newBillInstance.fileAccepted = true

      const form = screen.getByTestId("form-new-bill") 
      const handleSubmit = jest.fn(newBillInstance.handleSubmit(mockEvent))

      form.addEventListener("submit", handleSubmit())
      fireEvent.submit(form)
      await new Promise(process.nextTick)
      
      expect(consoleErrorSpy).toBeCalledWith(new Error("500"))
    })
  })
})
