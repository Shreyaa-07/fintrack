import React, { useContext, useState } from "react"
import axios from 'axios'


const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:8001/api/v1/";

const GlobalContext = React.createContext()

export const GlobalProvider = ({children}) => {

    const [incomes, setIncomes] = useState([])
    const [expenses, setExpenses] = useState([])
    const [error, setError] = useState(null)
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)
        localStorage.setItem('theme', newTheme)
    }
    
    // Axios Interceptor for JWT
    axios.interceptors.request.use(
        (config) => {
            if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        },
        (error) => {
            return Promise.reject(error)
        }
    )

    // Auth Actions
    const login = async (userCredentials) => {
        try {
            const response = await axios.post(`${BASE_URL}login`, userCredentials)
            setToken(response.data.token)
            localStorage.setItem('token', response.data.token)
            setUser(response.data)
            setIsAuthenticated(true)
            setError(null)
        } catch (err) {
            setError(err.response.data.message)
        }
    }

    const register = async (userData) => {
        try {
            const response = await axios.post(`${BASE_URL}register`, userData)
            setToken(response.data.token)
            localStorage.setItem('token', response.data.token)
            setUser(response.data)
            setIsAuthenticated(true)
            setError(null)
        } catch (err) {
            setError(err.response.data.message)
        }
    }

    const logout = () => {
        setToken(null)
        localStorage.removeItem('token')
        setUser(null)
        setIsAuthenticated(false)
    }

    const userData = React.useCallback(async () => {
        try {
            const response = await axios.get(`${BASE_URL}user`)
            setUser(response.data)
            setIsAuthenticated(true)
        } catch (err) {
            logout()
        }
    }, [])

    React.useEffect(() => {
        if (token) {
            userData()
        }
    }, [token, userData])

    //calculate incomes
    const addIncome = async (income) => {
        await axios.post(`${BASE_URL}add-income`, income)
            .catch((err) =>{
                setError(err.response.data.message)
            })
        getIncomes()
    }

    const getIncomes = async () => {
        const response = await axios.get(`${BASE_URL}get-incomes`)
        setIncomes(response.data)
    }

    const deleteIncome = async (id) => {
        await axios.delete(`${BASE_URL}delete-income/${id}`)
        getIncomes()
    }

    const totalIncome = () => {
        let totalIncome = 0;
        incomes.forEach((income) =>{
            totalIncome = totalIncome + income.amount
        })

        return totalIncome;
    }


    //calculate expenses
    const addExpense = async (income) => {
        await axios.post(`${BASE_URL}add-expense`, income)
            .catch((err) =>{
                setError(err.response.data.message)
            })
        getExpenses()
    }

    const getExpenses = async () => {
        const response = await axios.get(`${BASE_URL}get-expenses`)
        setExpenses(response.data)
    }

    const deleteExpense = async (id) => {
        await axios.delete(`${BASE_URL}delete-expense/${id}`)
        getExpenses()
    }

    const totalExpenses = () => {
        let totalIncome = 0;
        expenses.forEach((income) =>{
            totalIncome = totalIncome + income.amount
        })

        return totalIncome;
    }


    const totalBalance = () => {
        return totalIncome() - totalExpenses()
    }

    const transactionHistory = () => {
        const history = [...incomes, ...expenses]
        history.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt)
        })

        return history.slice(0, 3)
    }

    const fullHistory = () => {
        const history = [...incomes, ...expenses]
        history.sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt)
        })

        return history
    }


    return (
        <GlobalContext.Provider value={{
            addIncome,
            getIncomes,
            incomes,
            deleteIncome,
            expenses,
            totalIncome,
            addExpense,
            getExpenses,
            deleteExpense,
            totalExpenses,
            totalBalance,
            transactionHistory,
            fullHistory,
            error,
            setError,
            login,
            register,
            logout,
            user,
            isAuthenticated,
            token,
            theme,
            toggleTheme
        }}>
            {children}
        </GlobalContext.Provider>
    )
}

export const useGlobalContext = () =>{
    return useContext(GlobalContext)
}
