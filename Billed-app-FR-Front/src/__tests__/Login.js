/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login";
import { ROUTES } from "../constants/routes";
import { fireEvent, screen, waitFor } from "@testing-library/dom";

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-employee");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-employee")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on employee button Login In", () => {
    test("Then I should be identified as an Employee in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        email: "johndoe@email.com",
        password: "azerty",
      };

      const inputEmailUser = screen.getByTestId("employee-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("employee-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-employee");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitEmployee);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Employee",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    test("It should renders Bills page", () => {
      expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
    });
  });

  // Définition de test pour le scénario où je saisis des données correctes mais inexistantes et que je clique sur le bouton de connexion Employee
  describe("When I enter correct but non-existent data and click on the Employee Login button", () => {
    // Test pour vérifier que la méthode createUser est appelée et que le message d'erreur est égal à "Simulated error"
    test("Then it should call the method createUser and the error message should be equal to Simulated Connection error", async () => {
      document.body.innerHTML = LoginUI()

      // Créer une instance de la classe Login
      const instanceLogin = new Login({
        document: document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: window.localStorage
     })
      // Créer un objet simulé avec la méthode preventDefault
      const eventMock = {
        preventDefault: jest.fn(),
        target: {
          querySelector: jest.fn(selector => {
            if (selector === 'input[data-testid="employee-email-input"]') {
              return { value: "testEmployee@email.com" }
            } else if (selector === 'input[data-testid="employee-password-input"]') {
              return { value: "azerty" }
            } else {
              return null // Retourne null si le sélecteur n'est pas reconnu
            }
          })
        }
      }

      // Mock de la méthode this.login pour simuler une erreur
      instanceLogin.login = jest.fn(() => Promise.reject(new Error('Simulated Connection Error')));

      // Mock de la méthode createUser sur l'instance de la classe Login
      createUserSpy = jest.spyOn(instanceLogin, 'createUser')
  
      // Act
      try{
        instanceLogin.handleSubmitEmployee(eventMock)

        // Mock de l'objet user
        const user = {
          type: "Employee",
          email: "testEmployee@email.com",
          password: "azerty",
          status: "connected"
        }
        await instanceLogin.login(user).then(() => {
          console.log('Connecter avec succes')
        })
      }
      catch(err){
        expect(err.message).toEqual("Simulated Connection Error")
        expect(createUserSpy).toHaveBeenCalled()
      }
    })
  })

  // Définition de test pour le scénario où je saisis des données correctes mais inexistantes et que je clique sur le bouton de connexion Admin
  describe("When I enter correct but non-existent data and click on the Admin Login button", () => {    
    // Test pour vérifier que la méthode createUser est appelée et que le message d'erreur est égal à "Simulated error"
    test("Then it should call the method createUser and the error message should be equal to Simulated error", async () => {
      document.body.innerHTML = LoginUI()
      
      // Créer une instance de la classe Login
      const instanceLogin = new Login({
        document: document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: window.localStorage
     })
      // Créer un objet simulé avec la méthode preventDefault
      const eventMock = {
        preventDefault: jest.fn(),
        target: {
          querySelector: jest.fn(selector => {
            if (selector === 'input[data-testid="admin-email-input"]') {
              return { value: "testAdmin@email.com" }
            } else if (selector === 'input[data-testid="admin-password-input"]') {
              return { value: "azerty" }
            } else {
              return null // Retourne null si le sélecteur n'est pas reconnu
            }
          })
        }
      }

      // Mock de la méthode this.login pour simuler une erreur
      instanceLogin.login = jest.fn(() => Promise.reject(new Error('Simulated Connection Error')));

      // Mock de la méthode createUser sur l'instance de la classe Login
      createUserSpy = jest.spyOn(instanceLogin, 'createUser')
  
      try{
        instanceLogin.handleSubmitAdmin(eventMock)

        // Mock de l'objet user
        const user = {
          type: "Admin",
          email: "testAdmin@email.com",
          password: "azerty",
          status: "connected"
        }
        await instanceLogin.login(user).then(() => {
          console.log('Connecter avec succes')
        })
      }
      catch(err){
        expect(err.message).toEqual("Simulated Connection Error")
        expect(createUserSpy).toHaveBeenCalled()
      }
    })
  })
})

describe("Given that I am a user on login page", () => {
  describe("When I do not fill fields and I click on admin button Login In", () => {
    test("Then It should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      expect(inputEmailUser.value).toBe("");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      expect(inputPasswordUser.value).toBe("");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
    test("Then it should renders Login page", () => {
      document.body.innerHTML = LoginUI();

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: "pasunemail" } });
      expect(inputEmailUser.value).toBe("pasunemail");

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, { target: { value: "azerty" } });
      expect(inputPasswordUser.value).toBe("azerty");

      const form = screen.getByTestId("form-admin");
      const handleSubmit = jest.fn((e) => e.preventDefault());

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(screen.getByTestId("form-admin")).toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on admin button Login In", () => {
    test("Then I should be identified as an HR admin in app", () => {
      document.body.innerHTML = LoginUI();
      const inputData = {
        type: "Admin",
        email: "johndoe@email.com",
        password: "azerty",
        status: "connected",
      };

      const inputEmailUser = screen.getByTestId("admin-email-input");
      fireEvent.change(inputEmailUser, { target: { value: inputData.email } });
      expect(inputEmailUser.value).toBe(inputData.email);

      const inputPasswordUser = screen.getByTestId("admin-password-input");
      fireEvent.change(inputPasswordUser, {
        target: { value: inputData.password },
      });
      expect(inputPasswordUser.value).toBe(inputData.password);

      const form = screen.getByTestId("form-admin");

      // localStorage should be populated with form data
      Object.defineProperty(window, "localStorage", {
        value: {
          getItem: jest.fn(() => null),
          setItem: jest.fn(() => null),
        },
        writable: true,
      });

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      let PREVIOUS_LOCATION = "";

      const store = jest.fn();

      const login = new Login({
        document,
        localStorage: window.localStorage,
        onNavigate,
        PREVIOUS_LOCATION,
        store,
      });

      const handleSubmit = jest.fn(login.handleSubmitAdmin);
      login.login = jest.fn().mockResolvedValue({});
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalled();
      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        "user",
        JSON.stringify({
          type: "Admin",
          email: inputData.email,
          password: inputData.password,
          status: "connected",
        })
      );
    });

    test("It should renders HR dashboard page", () => {
      expect(screen.queryByText("Validations")).toBeTruthy();
    });
  });
})
