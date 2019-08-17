window.app = new (class App {
    constructor() {
        this.renderHeroesList();
        this.renderGossips();
        addParticipant.addEventListener('click', () => this.openForm());
        cancelForm.addEventListener('click', () => this.closeForm());
        signIn.addEventListener('click', () => this.getCurrentUser() ? this.signOut() : this.openSignIn());
        cancelSignIn.addEventListener('click', () => this.closeSignIn());
        addForm.addEventListener('submit', (event) => this.submitForm(event));
        signInForm.addEventListener('submit', (event) => this.submitSignIn(event));
        firebase.auth().onAuthStateChanged((user) => {
            const newDisplayValue = user ? '' : 'none'; 
            addParticipant.style.display = newDisplayValue;
            addGossip.style.display = newDisplayValue;
        });
        this.addInputs = Array.from(addForm.elements).filter(elem => elem.localName == 'input');
        this.signInInputs = Array.from(signInForm.elements).filter(elem => elem.localName == 'input');
    }

    renderHeroesList() {
        const App = this;
        firebase.firestore().collection("participants").get().then(querySnapshot => {
            var listFragment = document.createDocumentFragment();
            var results = [];
            querySnapshot.forEach(doc => {
                console.log(doc.id, " => ", doc.data());
                console.log(App);
                var data = doc.data();
                results.push({
                    id: doc.id,
                    name: data.name,
                    portraits: data.heirlooms.portraits,
                    busts: data.heirlooms.busts,
                    deeds: data.heirlooms.deeds,
                    crests: data.heirlooms.crests,
                    score: data.heirlooms.portraits * 4 + data.heirlooms.busts * 3 + data.heirlooms.deeds * 2 + data.heirlooms.crests * 1,
                })
            })
            results.sort((participantA, participantB) => participantB.score - participantA.score)
            .forEach(function(participant) {
                var listItem = document.createElement('li');
                listItem.innerHTML = `<span>${participant.name}</span> - <span>${participant.score}</span> - <img class="heirloom" src="./images/heirlooms/Icon_Portrait.png" alt="Portraits"><span>${participant.portraits}</span> <img class="heirloom" src="./images/heirlooms/Icon_Bust.png" alt="Busts"><span>${participant.busts}</span> <img class="heirloom" src="./images/heirlooms/Icon_Deed.png" alt="Deeds"><span>${participant.deeds}</span> <img class="heirloom" src="./images/heirlooms/Icon_Crest.png" alt="Crests"><span>${participant.crests}</span>`;
                listFragment.appendChild(listItem);
            });
            App.participants = results;
            participants.innerHTML ='';
            participants.appendChild(listFragment);
        })
    }

    renderGossips() {
        firebase.firestore().collection("gossips").get().then(function(querySnapshot) {
            var listFragment = document.createDocumentFragment();
            querySnapshot.forEach(function(doc) {
                console.log(doc.id, " => ", doc.data());
                var data = doc.data();
                var listItem = document.createElement('li');
                listItem.innerHTML = `<span>${data.msg}</span> <span id="${doc.id}">X</span>`;
                listFragment.appendChild(listItem);
            })
            gossips.innerHTML ='';
            gossips.appendChild(listFragment);
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