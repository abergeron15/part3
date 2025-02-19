import { useState, useEffect } from 'react'
import personServices from './services/persons'

import './index.css'


const Notification = ({ notification }) => {
  return notification === null
    ? null
    : (
      <div className={notification.type} >
        {notification.message}
      </div>
    )
}

const Input = ({ value, text, onChange }) => (
  <>
    {text}:{' '}
    <input
      value={value}
      onChange={onChange}
    />
  </>
)

const AddPersonForm = ({ onSubmit, inputs }) => (
  <form onSubmit={onSubmit}>
    <div>
      <h2>add a new</h2>
      {inputs.map(input => <div key={input.text}><Input value={input.value} text={input.text} onChange={input.onChange} /><br /></div>)}
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
)

const Person = ({ person, onDelete }) => {

  return (
    <tr><th align='left'>{person.name}:</th><td>{person.number}</td><td><button onClick={onDelete}>delete</button></td></tr>
  )
}

const Numbers = ({ personsToShow, onDelete }) => {

  return (
    <div>
      <h2>Numbers</h2>
      <div>
        <table>
          <tbody>
            {personsToShow.map(person => <Person key={person.name} person={person} onDelete={(event) => onDelete(event, person)} />)}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newSearch, setNewSearch] = useState('')
  const [notification, setNotification] = useState({})

  const addPersonSuccess = 'success'

  useEffect(() => {
    console.log('effect')
    personServices
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  console.log('rendered', persons.length, 'people')

  const handleSearchChange = (event) => {
    setNewSearch(event.target.value)
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const addToPhonebook = (event) => {
    event.preventDefault()

    if (persons.some(person => person.name === newName && person.number === newNumber)) {
      alert(`${newName} is already added to phonebook with that number`)
      return
    }
    else if (persons.some(person => person.name === newName)) {
      if (confirm(`${newName} is already added to phonebook, replace the old number with new one?`)) {
        const existingPerson = persons.find(p => p.name === newName)
        personServices
          .update(existingPerson.id, { ...existingPerson, number: newNumber })
          .then(updatedPerson => {
            console.log('updated', updatedPerson)
            setPersons(persons.map(p => p.id === updatedPerson.id ? updatedPerson : p))
            setNotification({
              message: `updated ${updatedPerson.name} with number ${updatedPerson.number}`,
              type: 'success'
            })
            setTimeout(() => {
              setNotification({})
            }, 3000)
          })
          .catch(error => {
            console.log(error)
            setNotification({
              message: `could not update number`,
              type: 'error',
            })
            setTimeout(() => {
              setNotification({})
            }, 3000)
          })
      }
      return
    }

    const newPerson = {
      name: newName,
      number: newNumber,
    }

    personServices
      .create(newPerson)
      .then(personData => {
        console.log(personData)
        setPersons(persons.concat(personData))
        setNewName('')
        setNewNumber('')
        setNotification({
          message: `added ${personData.name}`,
          type: 'success'
        })
        setTimeout(() => {
          setNotification({})
        }, 3000)
      })
      .catch(error => {
        console.log(error.response.data.error)
        setNotification({
          message: error.response.data.error,
          type: 'error',
        })
        setTimeout(() => {
          setNotification({})
        }, 3000)
      })
  }

  const removeFromPhonebook = (event, person) => {
    event.preventDefault()
    console.log(event)
    if (confirm(`Delete ${person.name}?`)) {
      personServices
        .del(person.id)
        .then(() => {
          console.log('deleted', person)
          setPersons(persons.filter(p => p.id !== person.id))
          setNotification({
            message: `deleted ${person.name}`,
            type: 'success',
          })
          setTimeout(() => {
            setNotification({})
          }, 3000)
        })
        .catch(error => {
          console.log(error)
          setNotification({
            message: `${person.name} was already deleted`,
            type: 'error',
          })
          setTimeout(() => {
            setNotification({})
          }, 3000)
        })
    }
  }

  const personsToShow = persons.filter(person => person.name.toLowerCase().includes(newSearch.toLowerCase()))

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification notification={notification} />
      <Input value={newSearch} text='search' onChange={handleSearchChange} />
      <AddPersonForm
        onSubmit={addToPhonebook}
        inputs={[
          {
            value: newName,
            text: 'name',
            onChange: handleNameChange,
          },
          {
            value: newNumber,
            text: 'number',
            onChange: handleNumberChange,
          }
        ]}
      />
      <Numbers personsToShow={personsToShow} onDelete={removeFromPhonebook} />
    </div>
  )
}

export default App