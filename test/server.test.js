const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('../server/server');
const{Todo} = require('../server/models/todo');

const todos =[{
    _id: new ObjectID(),
    text:'First test todo'
},{
    _id: new ObjectID(),
    text:'Second test todo',
    completed: true,
    completedAt:333
}];

beforeEach((done)=>{
    Todo.remove({}).then(()=>{
        Todo.insertMany(todos);
    }).then(()=> done());
});

describe('POST /todos',()=>{
    it('should create a new todo',(done)=>{
        var text = 'Test todo text';

        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect((res)=>{
                expect(res.body.text).toBe(text);
            })
            .end((err,res)=>{
                if(err){
                    return done(err);
                }

                Todo.find({text}).then((todos)=>{
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e)=> done(e));
            });
    });

    it('Should not create todo with invalid body data',(done)=>{
        
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err,res)=>{
                if(err){
                    return done(err);
                }

                Todo.find().then((todos)=>{
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e)=> done(e));
    });

    });
});


describe('GET /todos',()=>{
    it('should get all todos',(done)=>{
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res)=>{
                expect(res.body.todos.length).toBe(2);
            })
            .end(done);
    });
});


describe('GET /todos/:id', ()=>{
    it('should return todo doc',(done)=>{
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done)=>{
        var HexID = new ObjectID().toHexString();

        request(app)
            .get(`/todos/${HexID}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object ids',(done)=>{
        request(app)
            .get('/todos/123')
            .expect(404)
            .end(done);
    });
});


describe('DeLETE /todos/:id', ()=>{
    it('should remove a todo',(done)=>{
        var hexid = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexid}`)
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo._id).toBe(hexid);
            })
            .end((err,res)=>{
                if(err){
                    return done(err);
                }

                Todo.findById(hexid).then((todo)=>{
                    expect(todo).toNotExist();
                    done();
                }).catch((e)=> done(e));

                // request(app)
                //     .get(`/todos/${hexid}`)
                //     .expect((res)=>{
                //         expect(res.body.todo).toNotExist();
                //     })
                //     .end(done);

            });
    });

    it('should return 404 if todo not found',(done)=>{
        var HexID = new ObjectID().toHexString();

        request(app)
            .delete(`/todos/${HexID}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 if object id is invalid',(done)=>{
        request(app)
        .delete('/todos/123')
        .expect(404)
        .end(done);
    });
});

describe('PATCH /todos/:id',()=>{
    it('should update the todo',(done)=>{
        var hexid = todos[0]._id.toHexString();

        request(app)
            .patch(`/todos/${hexid}`)
            .send({
                "text":"PATCH test todo",
                "completed":true
            })
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe("PATCH test todo");
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toBeA('number');
            })
            .end(done);
    });

    it('should clear completedAt when todo is not completed',(done)=>{
        var hexid = todos[1]._id.toHexString();

        request(app)
            .patch(`/todos/${hexid}`)
            .send({
                "text":"PATCH test2 todo",
                "completed":false
            })
            .expect(200)
            .expect((res)=>{
                expect(res.body.todo.text).toBe("PATCH test2 todo");
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toNotExist();
            })
            .end(done);
    });
})