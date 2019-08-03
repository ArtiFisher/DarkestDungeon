window.onload = () => {
    mock.addEventListener('click', () => {
        var collection = firebase.firestore().collection("participants");
        return collection.add({
            name: 'John Smith',
            score: 0
        });
    });   
}

