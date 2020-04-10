//enrutador
const express = require('express');
const router = express.Router();

const Note = require('../models/Note');

const {isAuthenticated} = require('../helpers/auth')

router.get('/notes/add',isAuthenticated ,(req, res)=>{
    res.render('notes/new-notes');
});

router.post('/notes/new-notes',isAuthenticated,async(req,res)=>{
    const {title, description} = req.body;
    const errors =[];
    if (!title){
        errors.push({text: 'Por favor escribe un titulo'});
    }
    if (!description){
        errors.push({text:'por favor escribe la descripción'});
    }
    if(errors.length > 0){
        res.render('notes/new-notes',{
          errors,
          title,
          description  
        });
    } else {
        const newNotes = new Note({title,description});
        newNotes.user = req.user.id;
        await newNotes.save()
        req.flash('success_msg','Note added Successfully!')
        res.redirect('/notes')
    }
});


router.get('/notes',isAuthenticated ,async (req, res) => {
    await Note.find({user: req.user.id}).sort({date:'desc'})
      .then(documentos => {
        const contexto = {
            notes: documentos.map(documento => {
            return {
                title: documento.title,
                description: documento.description,
                id: documento._id
            }
          })
        }
        
        res.render('notes/all-notes', {
        notes: contexto.notes }); 
      });
  });

    router.get('/notes/edit-note/:id', isAuthenticated,async (req, res)=>{
    const notes = await Note.findById(req.params.id);
    res.render('notes/edit-note',{notes});
  });

  router.put('/notes/edit-note/:id',isAuthenticated, async (req,res) => {
      const {title, description} = req.body;
      await Note.findByIdAndUpdate(req.params.id, {title,description});
      req.flash('success_msg','Note Udated Successfully!')
      res.redirect('/notes');
  });

  router.delete('/notes/delete/:id',isAuthenticated,async (req, res)=>{
    await Note.findByIdAndDelete(req.params.id);
    req.flash('success_msg','Note deleted Successfully!')
    res.redirect('/notes');
  });


module.exports = router;