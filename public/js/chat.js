const socket = io()

const $messageForm = document.querySelector("#message-form");

const $messageFormInput = document.querySelector('input');

const $messageFormButton = document.querySelector('button')

const $sendLocation = document.querySelector('#send-location')

const $messages = document.querySelector('#messages')

//template

const messageTemplate = document.querySelector("#message-template").innerHTML

const locationMessageTemplate = document.querySelector("#location-message-template").innerHTML

const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML



const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
	// New message element
	const $newMessage = $messages.lastElementChild

	// Height of the new message
	const newMessageStyles = getComputedStyle($newMessage)
	const newMessageMargin = parseInt(newMessageStyles.marginBottom)
	const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

	// Visible height
	const visibleHeight = $messages.offsetHeight

	// Height of messages container
	const containerHeight = $messages.scrollHeight

	// How far have I scrolled?
	const scrollOffset = $messages.scrollTop + visibleHeight

	if (containerHeight - newMessageHeight <= scrollOffset) {
		$messages.scrollTop = $messages.scrollHeight
	}
}



socket.on('message', (message) => {
	console.log(message)

	const html = Mustache.render(messageTemplate, {
		username: message.username,
		message: message.text,
		createdAt: moment(message.createdAt).format('h:mm a')

	})

	$messages.insertAdjacentHTML('beforeend', html)

	autoscroll()


})


socket.on('locationmessage', (message) => {




	const html = Mustache.render(locationMessageTemplate, {
		username: message.username,
		url: message.url,
		createdAt: moment(message.createdAt).format('h:mm a')

	})

	$messages.insertAdjacentHTML('beforeend', html)
	autoscroll()
})


socket.on('roomData', ({ room ,users }) => {

	const html = Mustache.render(sidebarTemplate, {
		room,
		users
    })

	document.querySelector('#sidebar').innerHTML = html

}) 




$messageForm.addEventListener('submit', (e) => {

	e.preventDefault();

	$messageFormButton.setAttribute('disabled' , 'disabled')


	const message = e.target.elements.message.value

	socket.emit('sendMessage', message, (error) => {

		$messageFormButton.removeAttribute('disabled')

		$messageFormInput.value = " ";

		$messageFormInput.focus()


		if (error) {
			console.log(error)
        }
		else
		console.log("the message delivered")

	})

})
$sendLocation.addEventListener('click', () => {

	if (!navigator.geolocation) {
		return alert("Your browser does not support geolocation")
	}


	$sendLocation.setAttribute('disabled' ,'disabled')  





	navigator.geolocation.getCurrentPosition((position) => {
		
		  
		socket.emit('sendlocation', {

			latitude: position.coords.latitude ,

			longitude: position.coords.longitude


			//endLocation.focus();


		}, () => {

				$sendLocation.removeAttribute('disabled')

				console.log("location shared")

		})

    })



})



socket.emit('join', { username, room }, (error) => {

	if (error) {
		alert(error)
		location.href='/'
    }

})





