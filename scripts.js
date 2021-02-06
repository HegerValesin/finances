const Modal = {
    open() {
        //abrir
        document.querySelector('.modal-overlay')
        .classList.add('active')
    },
    close() {
        //fechar
        document.querySelector('.modal-overlay')
        .classList.remove('active')
    }
}

const Storage = {//insere ou busca os dados no Local Storge
    get() {
        return JSON.parse(localStorage.getItem("HeD.finances:transactions")) || []
    },
    set(transactions) {
        localStorage.setItem("HeD.finances:transactions", JSON.stringify(transactions))
    }
}

const Transaction = {
    all: Storage.get(),

    add(transaction){
        Transaction.all.push(transaction)
        
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)

        App.reload()
    },

    incomes() { 
        let income = 0;
          Transaction.all.forEach(transaction => {
              if( transaction.amount > 0 ) {
                  income += transaction.amount;
              }
          })
        return income;
    },

    expenser() {
        let expense = 0;
          Transaction.all.forEach(transaction => {
              if( transaction.amount < 0 ) {
                  expense += transaction.amount;
              }
          })
        return expense;
    },

    total() {
        
        return Transaction.incomes() + Transaction.expenser();
    }
}

const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),
    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)

    },
    innerHTMLTransaction(transaction, index) {
       
        const CSSclass = transaction.rdEntSai > 0 ? "income" : "expense"
        
        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td class="description">${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td class="date">${transaction.date}</td>
            <td>
                <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remove lançamento">
            </td>
        `
        return html
    },

    updateBalance() {
        document
        .getElementById('incomeDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.incomes())
        document
        .getElementById('expenseDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.expenser())
        document
        .getElementById('totalDisplay')
        .innerHTML = Utils.formatCurrency(Transaction.total())
    },
    clearTrasactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {

    formatAmount(value) {
        value = Number(value) * 100 // ou Number(value.replace(/\,?\.?/g, "")) * 100 tbm poderia ser assim ou só o Number(value) * 100
        return Math.round(value)
    },

    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },

    formatCurrency(value) {
    
        const signal = Number(value) < 0 ? "-" : "" //Number(value) < 0 ? "-" : "" // mudar sigle para if
     
        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency:"BRL"
        })

        return signal + value
    }
}

const Form = {//foi acrecentado o type rdEntSai
    description: document.querySelector('input#description'),
    rdEntSai: document.querySelector('input.rdEntSai'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues() { //foi acrecentado o tipe rdEntSai
        return {
            description: Form.description.value,
            rdEntSai: Form.rdEntSai.checked,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },

    validateFields() {

        const { description, rdEntSai, amount, date } = Form.getValues()
       
        if( description.trim() === "" ||
          //  rdEntSai.trim() === "" ||
            amount.trim() === "" || 
            date.trim() === "") {
                throw new Error("Por favor preencha todos os campos ou selecionar se é Entreda ou Saída!")
        }
    },

    formatValues() {
        let { description, rdEntSai, amount, date } = Form.getValues()
    
        if (rdEntSai == false){
            amount = -+amount
        } 
        amount = Utils.formatAmount(amount)
          
        date = Utils.formatDate(date)

        return {
            description,
            rdEntSai,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()

        try {
          
           Form.validateFields()
           const transaction = Form.formatValues()
           Transaction.add(transaction)
           Form.clearFields()
           Modal.close()
         
        } catch (error) {
            alert(error.message)
        }        
    }
}

const App = {
    init() {
                
        Transaction.all.forEach((transaction, index) => {
            DOM.addTransaction(transaction, index)
        })

        DOM.updateBalance()

        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTrasactions()
        App.init()
    }
}

App.init()
