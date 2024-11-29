import { useEffect, useState } from 'react'
import './App.css'

interface ExchangeRate {
	r030: number
	txt: string
	rate: number
	cc: string
	exchangedate: string
}

function App() {
	const [course, setCourse] = useState(0)

	const fetchCourse = async () => {
		try {
			const response = await fetch(
				'https://bank.gov.ua/NBUStatService/v1/statdirectory/exchange?json'
			)
			if (!response.ok) {
				throw new Error(`Error: ${response.statusText}`)
			}
			const data = await response.json()
			data.map((course: ExchangeRate) => {
				if (course && course?.cc === 'USD') {
					setCourse(course.rate)
				}
			})
		} catch {
			console.error('Fetch error')
			//Just make sure you don't get that message in offline mode
		}
	}

	useEffect(() => {
		fetchCourse()

		const intervalId = setInterval(() => {
			fetchCourse()
		}, 60_000)

		return () => clearInterval(intervalId)
	}, [])

	return (
		<>
			<h1>React + Service worker</h1>
			<h2>Image (Must be cached)</h2>
			<img
				src="https://images.pexels.com/photos/674010/pexels-photo-674010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
				alt="img"
			/>
			<p>{navigator.onLine ? 'Online' : 'Offline'}</p>
			<h2>Course</h2>
			{navigator.onLine
				? course && <p>1 UAH = {course} USD</p>
				: 'Course is available only online'}
		</>
	)
}

export default App
