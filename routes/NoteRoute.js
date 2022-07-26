const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const fetchUser = require('../middleware/fetchUser');
const { body, validationResult } = require('express-validator');

// Route 1: Getting all the notes of the user : GET "api/note". Login required
router.post("/fetch", fetchUser, async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user.id });
        return res.status(200).json(notes);
    }
    catch (error) {
        return res.status(500).json({ error: "Unknown Error Occured" });
    }
});

//Route 2: Add a new note to the particular user : POST "api/note". Login required 
router.post("/",
    fetchUser,
    [
        body('title', 'Title must be at least 3 characters').isLength({ min: 3 }),
        body('description', 'Description must be atleast 5 characters').isLength({ min: 5 })
    ],
    async (req, res) => {

        try {
            const { title, description, tag } = req.body;
            const note = await Note.create({
                userId: req.user.id,
                title: title,
                description: description,
                tag: (tag === undefined) ? "general" : tag
            });

            return res.status(201).json(note);
        }
        catch (error) {
            return res.status(500).json({ error: "Unknown Error Occured" });
        }
    });

//Route 3: Update an existing note : PUT "api/note/:noteId". Login required
router.put("/:noteId",
    fetchUser,
    [
        body('title', 'Title must be at least 3 characters').isLength({ min: 3 }),
        body('description', 'Description must be atleast 5 characters').isLength({ min: 5 })
    ],
    async (req, res) => {
        const noteId = req.params.noteId;
        const { title, description, tag } = req.body;
        const newNote = {};
        if(title) newNote.title = title;
        if(description) newNote.description = description;
        if(tag) newNote.title = tag;

        try {
            let note = await Note.findById(noteId);
            
            if(note.userId.toString() !== req.user.id) return res.status(401).json({error:"Not allowed"});

            note = await Note.findByIdAndUpdate(noteId,{$set : newNote},{new:true});
            return res.status(200).json({ title, description });
        }
        catch (error) {
            return res.status(404).json({ error: "Invalid id to be updated" });
        }
    });


//Route 4: Delete an existing note of the particular user: DELETE "api/note/id".Login required
router.delete("/:noteId",
    fetchUser,
    async (req,res) => {
        const noteId = req.params.noteId;
        try {
            
            let note = await Note.findById(noteId);
            if(note.userId.toString() !== req.user.id) return res.status(401).json({error:"Not allowed"});

            note = await Note.findByIdAndDelete(noteId);

            return res.status(200).json({note});
        }
        catch (error) {
            return res.status(404).json({ error: "Invalid id to be deleted" });
        }
    });

module.exports = router;