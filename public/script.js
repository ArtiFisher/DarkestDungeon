window.auth = {
    getCurrentUser: () => firebase.auth().currentUser,
    signOut: () => firebase.auth().signOut().then(() => console.info('Sign-out successful')).catch(console.error),
    signIn: (email, password) => firebase.auth().signInWithEmailAndPassword(email, password).then(() => console.info('Sign-in successful')).catch(console.error),
    updatePassword: (newPassword) =>  this.auth.getCurrentUser().updatePassword(newPassword).then(() => console.info('Update successful')).catch(console.error)
}

window.players = {
    drawList: () => {
        firebase.firestore().collection("participants").orderBy("score", "desc").get().then(function(querySnapshot) {
            var listFragment = document.createDocumentFragment();
            querySnapshot.forEach(function(doc) {
                console.log(doc.id, " => ", doc.data());
                var data = doc.data();
                var listItem = document.createElement('li');
                listItem.innerHTML = `<span>${data.name}</span><span>${data.score}</span>`;
                listFragment.appendChild(listItem);
            });
            participants.innerHTML ='';
            participants.appendChild(listFragment);
        })
    }
}

window.players.drawList();
addParticipant.addEventListener('click', () => {
    modal.style.display = 'block';
});

firebase.auth().onAuthStateChanged((user) => addParticipant.style.display = user ? '' : 'none');

addForm.addEventListener("submit", function (event) {
    event.preventDefault();
    var inputs = Array.from(addForm.elements)
        .filter(elem => elem.localName == 'input');
    var values = inputs.map(input => input.value);
    firebase.firestore().collection("participants").add({
        name: values[0],
        score: values[1],
        phone: values[2],
        email: values[3]
    })
        .then(() => console.info("Added", values))
        .catch(console.error);
    inputs.forEach(input => input.value = '');
    modal.style.display = 'none';
});