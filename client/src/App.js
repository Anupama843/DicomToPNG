import React, {useState, useEffect} from 'react'

function App() {
  const [date, setData] = useState([{}])
  useEffect(() => {
    fetch("/members").then(
      res => res.json()
    ).then(
      data => {
        setData(data)
        console.log(data)
      }
    )
  }, [])

  return (
    <div>
      {( typeof date.members === 'undefined')? (
        <p> Loading...</p>
      ) : (
        date.members.map((member, i) => (
          <p key={i}>{member}</p>
        ))
      )}
    </div>
  )
}

export default App