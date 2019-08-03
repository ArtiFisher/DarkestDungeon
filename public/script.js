window.auth = {
    getCurrentUser: () => firebase.auth().currentUser,
    signOut: () => firebase.auth().signOut().then(() => console.info('Sign-out successful')).catch(console.error),
    signIn: (email, password) => firebase.auth().signInWithEmailAndPassword(email, password).then(() => console.info('Sign-in successful')).catch(console.error),
    updatePassword: (newPassword) =>  this.auth.getCurrentUser().updatePassword(newPassword).then(() => console.info('Update successful')).catch(console.error)
}

window.players = {
    drawList: () => {
        firebase.firestore().collection("participants").get().then(function(querySnapshot) {
            var listFragment = document.createDocumentFragment();
            querySnapshot.forEach(function(doc) {
                console.log(doc.id, " => ", doc.data());
                var data = doc.data();
                var listItem = document.createElement('li');
                listItem.innerHTML = `<span>${data.name}</span><span>${data.score}</span>`;
                listFragment.appendChild(listItem);
            });
            participants.appendChild(listFragment);
        })
    }
}

window.players.drawList();