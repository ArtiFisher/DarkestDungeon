window.app = new (class App {
    constructor() {
        this.renderHeroesList();
        this.renderGossips();
        addParticipant.addEventListener('click', () => this.openForm());
        addGossip.addEventListener('click', () => this.openGossipForm());
        cancelForm.addEventListener('click', () => this.closeForm());
        cancelAddGossip.addEventListener('click', () => this.closeGossipForm());
        signIn.addEventListener('click', () => this.getCurrentUser() ? this.signOut() : this.openSignIn());
        cancelSignIn.addEventListener('click', () => this.closeSignIn());
        addForm.addEventListener('submit', event => this.submitForm(event));
        addGossipForm.addEventListener('submit', event => this.submitGossipForm(event));
        signInForm.addEventListener('submit', event => this.submitSignIn(event));
        participants.addEventListener('click', event => {
            var id = event.target.dataset.participantid;
            // if (id) {
            //     firebase.firestore().collection("participants").doc(id).delete().then(() => {
            //         console.log("Participant successfully deleted!");
            //         participants.removeChild(event.target.parentElement);
            //     }).catch(console.error);
            // }
            if (id) {
                this.openForm(this.participants[id]);
            }
        });
        gossips.addEventListener('click', event => {
            var id = event.target.dataset.gossipid;
            if (id) {
                firebase.firestore().collection("gossips").doc(id).delete().then(() => {
                    console.log("Gossip successfully deleted!");
                    gossips.removeChild(event.target.parentElement);
                }).catch(console.error);
            }
        });
        firebase.auth().onAuthStateChanged((user) => {
            const newDisplayValue = user ? '' : 'none'; 
            addParticipant.style.display = newDisplayValue;
            addGossip.style.display = newDisplayValue;
            user ? document.body.classList.add('admin') : document.body.classList.remove('admin');
        });
        this.addInputs = Array.from(addForm.elements).filter(elem => elem.localName == 'input');
        this.signInInputs = Array.from(signInForm.elements).filter(elem => elem.localName == 'input');
    }

    renderHeroesList() {
        const App = this;
        App.participants = {};
        firebase.firestore().collection("participants").get().then(querySnapshot => {
            var listFragment = document.createDocumentFragment();
            var results = [];
            querySnapshot.forEach(doc => {
                console.log(doc.id, " => ", doc.data());
                console.log(App);
                var data = doc.data();
                var result = {
                    id: doc.id,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    portraits: data.heirlooms.portraits,
                    busts: data.heirlooms.busts,
                    deeds: data.heirlooms.deeds,
                    crests: data.heirlooms.crests,
                    score: data.heirlooms.portraits * 4 + data.heirlooms.busts * 3 + data.heirlooms.deeds * 2 + data.heirlooms.crests * 1,
                };
                App.participants[doc.id] = result;
                results.push(result);
            })
            results.sort((participantA, participantB) => participantB.score - participantA.score)
                .forEach(function(participant) {
                    var listItem = document.createElement('li');
                    listItem.innerHTML = `<span data-participantId=${participant.id}>${participant.name}</span> - <span>${participant.score}</span><br><img class="heirloom" src="./images/heirlooms/Icon_Portrait.png" alt="Portraits"><span>${participant.portraits}</span> <img class="heirloom" src="./images/heirlooms/Icon_Bust.png" alt="Busts"><span>${participant.busts}</span> <img class="heirloom" src="./images/heirlooms/Icon_Deed.png" alt="Deeds"><span>${participant.deeds}</span> <img class="heirloom" src="./images/heirlooms/Icon_Crest.png" alt="Crests"><span>${participant.crests}</span>`;
                    // listItem.innerHTML = `<span>${participant.name}</span> - <span>${participant.score}</span>  <span class="delete" data-participantId=${participant.id}>X</span><br><img class="heirloom" src="./images/heirlooms/Icon_Portrait.png" alt="Portraits"><span>${participant.portraits}</span> <img class="heirloom" src="./images/heirlooms/Icon_Bust.png" alt="Busts"><span>${participant.busts}</span> <img class="heirloom" src="./images/heirlooms/Icon_Deed.png" alt="Deeds"><span>${participant.deeds}</span> <img class="heirloom" src="./images/heirlooms/Icon_Crest.png" alt="Crests"><span>${participant.crests}</span>`;
                    listFragment.appendChild(listItem);
                });
            participants.innerHTML = '';
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
                listItem.innerHTML = `<span>${data.msg}</span> <span class="delete" data-gossipId="${doc.id}">X</span>`;
                listFragment.appendChild(listItem);
            })
            gossips.innerHTML = '';
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

    openGossipForm() {
        addGossipContainer.style.display = 'block';
    }
    closeGossipForm() {
        addGossipInput.value = '';
        addGossipContainer.style.display = 'none';
    }
    submitGossipForm(event) {
        event.preventDefault();
        firebase.firestore().collection("gossips").add({
            msg: addGossipInput.value,
        })
            .then(() => console.info("Added gossip"))
            .catch(console.error);
        this.renderGossips();
        this.closeGossipForm();
    }

    openForm(participant) {
        formContainer.style.display = 'block';
        if (participant) {
            addForm.querySelector('button').innerText = 'Update';
            addForm.dataset.participant = participant.id;
            this.addInputs[0].value = participant.name || '';
            this.addInputs[1].value = participant.phone || '';
            this.addInputs[2].value = participant.email || '';
            this.addInputs[3].value = participant.portraits || 0;
            this.addInputs[4].value = participant.busts || 0;
            this.addInputs[5].value = participant.deeds || 0;
            this.addInputs[6].value = participant.crests || 0;
        }
    }
    closeForm() {
        this.addInputs.forEach(input => input.value = input.type == 'number' ? 0 : '');
        addForm.querySelector('button').innerText = 'Add';
        addForm.dataset.participant = '';
        formContainer.style.display = 'none';
    }
    submitForm(event) {
        event.preventDefault();
        var values = this.addInputs.map(({value}) => value);
        const result = {
            name: values[0],
            phone: values[1],
            email: values[2],
            heirlooms: {
                portraits: parseInt(values[3], 10),
                busts: parseInt(values[4], 10),
                deeds: parseInt(values[5], 10),
                crests: parseInt(values[6], 10),
            },
        };
        const participant = addForm.dataset.participant;
        if (participant) {
            firebase.firestore().collection("participants").doc(participant).update(result)
                .then(() => console.info("Updated", values))
                .catch(console.error);
        }
        else {
            firebase.firestore().collection("participants").add(result)
                .then(() => console.info("Added", values))
                .catch(console.error);
        }
        this.renderHeroesList();
        this.closeForm();
    }
})();