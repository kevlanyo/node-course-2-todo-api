const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

// Todo.remove({}).then((result)=>{
//     console.log(result);
// });

Todo.findOneAndRemove({_id:'5c14b8b1fdc8b02c4e9b7d38'}).then((todo)=>{

});

Todo.findByIdAndRemove('5c14b8b1fdc8b02c4e9b7d38').then((todo)=>{
    console.log(todo);
});
