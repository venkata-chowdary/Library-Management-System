const bodyParser =require('body-parser')
const express=require('express')
const { MongoAPIError } = require('mongodb')
const mongoose=require('mongoose')


const app=express()
app.use(bodyParser.urlencoded({extended:true}))
app.set('view engine','ejs')
app.use(express.static('public'))

mongoose.connect('mongodb://127.0.0.1:27017/libraryDB',{
    useNewUrlParser:true
})

const bookSchema=new mongoose.Schema({
    bookId:String,
    bookTitle:String,
    bookStock:Number,
    bookPublicationDate:String,
    borrowedBy: [
        { studentId: String }
    ],
})

const Book=new mongoose.model('Book',bookSchema)

const studentSchema=new mongoose.Schema({
    studentId:String,
    studentName:String,
    branch:String,
    studentContactNumber:String,
    studentEmail:String,
    booksTaken:[
        {bookId:String}
    ],
})

const Student=new mongoose.model('Student',studentSchema);

const borrowSchema=new mongoose.Schema({
    bookId:String,
    studentId:String,
})

const BorrowBook=new mongoose.model('BorrowBook',borrowSchema);

app.get('/',(req,res)=>{

    Book.find({})
    .then((data)=>{
        res.render('home.ejs',{
            books:data,
        })
    })
    .catch((err)=>{
        console.log(err)
    })  
})

app.get('/search',(req,res)=>{

    Book.find({
        bookTitle:req.query.bookSearch
    })
    .then((data)=>{
        res.render('home',{
            books:data,
        })
    })
    .catch((err)=>{
        console.log(err)
    })
    
})

.get('/addbook',(req,res)=>{
    res.render('addbook')
})

.post('/addbook',(req,res)=>{
    let book=new Book({
        bookId:req.body.bookId,
        bookTitle:req.body.bookTitle,
        bookStock:req.body.bookStock,
        bookPublicationDate:req.body.publicationDate,
    })
    book.save()
    console.log("Book Data added.")
    res.redirect('/addbook')
})

.get('/addstudent',(req,res)=>{
    res.render('addstudent')
})

.post('/addstudent',(req,res)=>{

    let student=new Student({
        studentId:req.body.studentId,
        studentName:req.body.studentName,
        branch:req.body.branch,
        studentEmail:req.body.studentEmail,
        studentContactNumber:req.body.contactNumber
    })

    student.save()
    console.log("Student data added")
    res.redirect('/addstudent')
})

.get('/borrowbook',(req,res)=>{
    BorrowBook.find({})
    .then((data)=>{
        res.render('borrowbook',{
            books:data,
        })
    })
    .catch((err)=>{
        console.log(err)
    })  
})

.get('/returnbook',(req,res)=>{
    res.render('returnbook')
})

.post('/returnbook',(req,res)=>{
    const bookId=req.body.bookId
    const studentId=req.body.studentId
    BorrowBook.findOne({bookId:bookId, studentId:studentId})
    .then((borrowedBook)=>{
        if(!borrowedBook){
            return res.status(404).send(`Student ${studentId} didn't borrow book ${bookId}`);
        }

        //incrementing stock and removing the student from the list 
        Book.findOne({bookId:bookId})
        .then((book)=>{
            if(!book){
                return res.status(404).send("Book not found!");
            }
            book.borrowedBy.pull({studentId:studentId})
            book.bookStock++
            book.save()
        })
        .catch((err)=>{
            console.log(err)
        })

        //removing book id from list of bookstaken of the student
        Student.findOne({studentId:studentId})
        .then((student)=>{
            if(!student){
                return res.status(404).send("Student not found!")
            }
            student.booksTaken.pull({bookId:bookId})
            student.save()
        })
        .catch((err)=>{
            console.log(err)
        })
        BorrowBook.findOneAndDelete({bookId:bookId, studentId:studentId})
        .then(()=>{
            console.log("returned book data removed from borrowed book collection")
        })

        res.send(`<h3>Book ${bookId} returned successfully by student ${studentId}</h3>`);
    })
    .catch((err) => {
        console.log(err);
    });
    
})

.get('/studentreport', (req, res) => {
    const searchTerm = req.query.studentSearchId;
  
    Student.find({})
      .then((data) => {
        Student.find({
            studentId:searchTerm
        })
          .then((searchedStudents) => {
            res.render('studentreport', {
              students: data,
              student: searchedStudents,
            });
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
});

app.post('/borrowbook',(req,res)=>{
    const bookId=req.body.bookId
    const studentId=req.body.studentId

    Book.findOne({bookId:req.body.bookId})
    .then((book)=>{
        if(!book){
            res.status(404).send("book not found!")
        }
        else if(book.bookStock<=0){
            res.status(404).send("<h3>Book is out of stock</h3>")
        }
        else{
            let borrowbook=new BorrowBook({
                bookId:bookId,
                studentId:req.body.studentId,
            })

            book.bookStock--
            book.borrowedBy.push({ studentId: req.body.studentId })

            Student.findOne({ studentId: studentId })
                .then((student) => {
                    if (student) {
                        student.booksTaken.push({ bookId: bookId });
                        student.save();
                    } else {
                        console.log("Student not found.");
                    }
                })
                .catch((err) => {
                    console.error(err);
                });
            borrowbook.save()
            book.save()
            res.send("<h3>Book borrowed successfully</h3>")
        }
    })
    .catch((err)=>{
        console.log(err)
    })

})



app.listen(3000,()=>{
    console.log('server is on 3000')
})



