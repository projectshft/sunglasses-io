// document.getElementById('submit-api').addEventListener('click', () => {
//   const apiKey = document.getElementById('api-box').value;
        
//   fetch('http://localhost:3000/users', {
//     method: 'GET',
//     headers: {
//       'X-ApiKey': apiKey
//     }
//   })
//   .then(response => {
//     if (response.ok) {
//       return response.json();
//     } else {
//        throw new Error('You definitely do not belong!')
//     }
//   })
//     .then(data => console.log(data))
//     .catch(error => console.error('Error', error));
// });

// document.getElementById('submit-login').addEventListener('click', () => {
//   const username = document.getElementById('username-box').value;
//   const password = document.getElementById('password-box').value;

//   fetch('http://localhost:3000/login', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'x-apikey': apiKey
//       },
//       body: JSON.stringify({ username, password })
//   })
//   .then(response => response.text())
//   .then(data => {
//     console.log('Response:', data);
//     alert(data);
//   })
//   .catch(error => {
//     console.error('Error', error);
//     alert('Failed shopper alert')
//   });
// });