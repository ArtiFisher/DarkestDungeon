window.app = new (class App {
    constructor() {
        this.drawList();
        addParticipant.addEventListener('click', () => this.openForm());
        cancelForm.addEventListener('click', () => this.closeForm());
        signIn.addEventListener('click', () => this.getCurrentUser() ? this.signOut() : this.openSignIn());
        cancelSignIn.addEventListener('click', () => this.closeSignIn());
        addForm.addEventListener('submit', (event) => this.submitForm(event));
        signInForm.addEventListener('submit', (event) => this.submitSignIn(event));
        firebase.auth().onAuthStateChanged((user) => addParticipant.style.display = user ? '' : 'none');
        this.addInputs = Array.from(addForm.elements).filter(elem => elem.localName == 'input');
        this.signInInputs = Array.from(signInForm.elements).filter(elem => elem.localName == 'input');
    }

    drawList() {
        firebase.firestore().collection("participants").get().then(function(querySnapshot) {
            var listFragment = document.createDocumentFragment();
            querySnapshot.forEach(function(doc) {
                console.log(doc.id, " => ", doc.data());
                var data = doc.data();
                var listItem = document.createElement('li');
                listItem.innerHTML = `<span>${data.name}</span> - <img class="heirloom" src="./images/heirlooms/Icon_Portrait.png" alt="Portraits"><span>${data.heirlooms.portraits}</span> <img class="heirloom" src="./images/heirlooms/Icon_Bust.png" alt="Busts"><span>${data.heirlooms.busts}</span> <img class="heirloom" src="./images/heirlooms/Icon_Deed.png" alt="Deeds"><span>${data.heirlooms.deeds}</span> <img class="heirloom" src="./images/heirlooms/Icon_Crest.png" alt="Crests"><span>${data.heirlooms.crests}</span>`;
                listFragment.appendChild(listItem);
            });
            participants.innerHTML ='';
            participants.appendChild(listFragment);
        })
    }

    getCurrentUser() {
        return firebase.auth().currentUser;
    }
    signOut() {
        firebase.auth().signOut().then(() => console.info('Sign-out successful')).catch(console.error);
    }
    signIn(email, password) {
        firebase.auth().signInWithEmailAndPassword(email, password).then(() => console.info('Sign-in successful')).catch(console.error)
    }
    updatePassword(newPassword) {
        this.getCurrentUser().updatePassword(newPassword).then(() => console.info('Update successful')).catch(console.error)
    }

    openSignIn() {
        signInContainer.style.display = 'block';
    }
    closeSignIn() {
        signInContainer.style.display = 'none';
    }
    submitSignIn(event) {
        event.preventDefault();
        this.signIn(...this.signInInputs.map(({value}) => value));
        this.closeSignIn();
    }

    openForm() {
        formContainer.style.display = 'block';
    }
    closeForm() {
        this.addInputs.forEach(input => input.value = '');
        formContainer.style.display = 'none';
    }
    submitForm(event) {
        event.preventDefault();
        var values = this.addInputs.map(({value}) => value);
        firebase.firestore().collection("participants").add({
            name: values[0],
            phone: values[1],
            email: values[2],
            heirlooms: {
                portraits: parseInt(values[3], 10),
                busts: parseInt(values[4], 10),
                deeds: parseInt(values[5], 10),
                crests: parseInt(values[6], 10),
            },
        })
            .then(() => console.info("Added", values))
            .catch(console.error);
        this.closeForm();
    }
})();