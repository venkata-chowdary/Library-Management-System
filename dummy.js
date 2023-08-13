// .then((data)=>{
//     BorrowBook.find({studentId:studentId})
//     .then((studentData)=>{
//         if (data.studentId===studentData.studentId){
//             console.log("student found")
//             Book.find({bookId})
//             .then((bookdata)=>{
//                 console.log(bookdata)
//                 bookdata.bookStock++
//                 console.log('book stock incremented')
//                 bookdata.borrowedBy.pull({ studentId: studentId });
//                 bookdata.save()
//             })
//             .catch((err)=>{
//                 console.log(err)
//             })
//             console.log(studentData)
//             // studentData.booksTaken.pull({bookId:bookId})
//             // studentData.save();
//         }
//         else{
//             res.status(404).send(`${studentData.studentId} doesn't borrowed ${req.body.bookId }`)
//         }
//     })
// })