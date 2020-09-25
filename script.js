const addForm = document.getElementById('addForm');
const messageAlert = document.getElementById('messageAlert');
const tasksList = document.getElementById('tasksList');

// DISPLAY data from Firestore in Real-time
const readTasks = data => {
    let activity = data.data().activity;
    let date = data.data().date.toDate().toDateString();
    let notes = data.data().notes;
    let owner = data.data().owner;

    let tr = document.createElement('tr');
    tr.setAttribute('data-id', data.id);

    let trElements = `
        <td>${date}</td>
        <td>${activity}</td>
        <td>${notes}</td>
        <td>${owner}</td>
        <td class="text-center"><i class="fas fa-trash-alt  text-danger delete" data-toggle="modal" data-target="#deletePrompt" title="Delete this task."></i> | <i class="fas fa-edit text-warning edit" title="Edit this task."></i></td>
    `;

    tr.insertAdjacentHTML('afterbegin', trElements);
    tasksList.appendChild(tr);
};


let activityAlert = (message, className) => {
    let alertPrompt = `<div id="messageAlert" class="alert ${className} text-center my-3" role="alert">${message}</div>`
    addForm.insertAdjacentHTML('afterend', alertPrompt);    
    setTimeout(() => { document.getElementById('messageAlert').remove(); }, 2000);
    setTimeout(() => { location.reload() }, 2100);
}


// READ data from Firebase-Firestore in Real-time
db.collection('tasks').orderBy('date', 'desc').limit(10)
    .onSnapshot(snapshot => {
        let changes = snapshot.docChanges();
        changes.forEach(change => {
            if(change.type === "added") {
                readTasks(change.doc);
            }
        }); 
    });


// ADD new task on form submit event
addForm.addEventListener('submit', e => {
    e.preventDefault();
    if (addForm.owner.value === "default" || addForm.notes.value === "" || addForm.activityType.value === "default") {
        activityAlert('Some fields are missing info...', 'alert-danger');
    } else {
        activityAlert('Task is successfully added to the list.', 'alert-info');
        let dateNow = new Date();
        console.log(dateNow);
        const task = {
            owner: addForm.owner.value,
            notes: addForm.notes.value.trim(),
            activity: addForm.activityType.value,
            date: dateNow
        }
        db.collection('tasks').add(task);
        addForm.reset();
    }
});

// DELETE data from the list and from Firebase-Firestore
tasksList.addEventListener('click', e => {
    if (e.target.classList.contains('delete')) {
        const dataID = e.target.parentElement.parentElement.getAttribute('data-id');

        document.getElementById('modalBodyMessage').innerHTML = e.target.parentElement.previousElementSibling.previousElementSibling.textContent;

        document.getElementById('deleteTaskBtn').addEventListener('click', () => {
            db.collection('tasks').doc(dataID).delete();
            e.target.parentElement.parentElement.remove();
        });
    }
}); 
