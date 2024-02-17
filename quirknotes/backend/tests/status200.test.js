// test("1+2=3, empty array is empty", () => {
//   expect(1 + 2).toBe(3);
//   expect([].length).toBe(0);
// });

// const SERVER_URL = "http://localhost:4000";

// test("/postNote - Post a note", async () => {
//   const title = "NoteTitleTest";
//   const content = "NoteTitleContent";

//   const postNoteRes = await fetch(`${SERVER_URL}/postNote`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       title: title,
//       content: content,
//     }),
//   });

//   const postNoteBody = await postNoteRes.json();

//   expect(postNoteRes.status).toBe(200);
//   expect(postNoteBody.response).toBe("Note added succesfully.");
// });
const axios = require('axios');
const baseUrl = 'http://localhost:4000';

const setupNote = async (title, content, color = null) => {
  const data = { title, content };
  if (color) data.color = color; //if color exist, add into the data
  const response = await axios.post(`${baseUrl}/postNote`, data);
  return response.data.insertedId;
};


const deleteAllNotes = async () => {
  await axios.delete(`${baseUrl}/deleteAllNotes`);
};

describe("Note API Tests", () => {
  beforeEach(async () => {
    // Ensure the database is in a known state before each test
    await deleteAllNotes();
  });

  test("/getAllNotes - Return list of zero notes for getAllNotes", async () => {
    const notesResponse = await axios.get(`${baseUrl}/getAllNotes`);
    expect(notesResponse.status).toBe(200);
    expect(notesResponse.data.response).toEqual([]);
  });

  test("/getAllNotes - Return list of two notes for getAllNotes", async () => {
    // Setup: Create two notes
    await setupNote("Test Title 1", "Test Content 1");
    await setupNote("Test Title 2", "Test Content 2");
  
    const notesResponse = await axios.get(`${baseUrl}/getAllNotes`);
    expect(notesResponse.status).toBe(200);
    expect(notesResponse.data.response.length).toBe(2);
  
    // Verification: Check that each note has the correct title and content
    const notes = notesResponse.data.response;
    expect(notes.some(note => note.title === "Test Title 1" && note.content === "Test Content 1")).toBe(true);
    expect(notes.some(note => note.title === "Test Title 2" && note.content === "Test Content 2")).toBe(true);
  });

  test("/deleteNote - Delete a note", async () => {
    // Setup: Create a note to delete
    const insertedId = await setupNote("Delete Me", "Delete this note");
    //can find
    const getResponse = await axios.get(`${baseUrl}/getAllNotes`);
    expect(getResponse.data.response.find(note => note._id === insertedId)).toBeDefined();

    const deleteResponse = await axios.delete(`${baseUrl}/deleteNote/${insertedId}`);
    expect(deleteResponse.status).toBe(200);

    // Verification: Ensure the note is deleted
    const getResponse2 = await axios.get(`${baseUrl}/getAllNotes`);
    expect(getResponse2.data.response.find(note => note._id === insertedId)).toBeUndefined();
  });

  test("/updateNoteColor - Update color of a note to red (#FF0000)", async () => {
    // Setup: Create a note to update its color
    const insertedId = await setupNote("Color Change", "This note will change color.");

    const updateResponse = await axios.patch(`${baseUrl}/updateNoteColor/${insertedId}`, {
      color: "#FF0000"
    });
    expect(updateResponse.status).toBe(200);

    // Verification: Fetch the note and verify the color change
    const getResponse = await axios.get(`${baseUrl}/getAllNotes`);
    const updatedNote = getResponse.data.response.find(note => note._id === insertedId);
    expect(updatedNote.color).toBe("#FF0000");
  });


  test("/patchNote - Patch with content and title", async () => {
    // Setup: Create a note to patch
    const insertedId = await setupNote("Patch Title", "Patch Content");

    //
    const originResponse = await axios.get(`${baseUrl}/getAllNotes`);
    const checkNote = originResponse.data.response.find(note => note._id === insertedId);
    expect(checkNote.title).toBe("Patch Title");
    expect(checkNote.content).toBe("Patch Content");
    
    // Patch the note
    const patchResponse = await axios.patch(`${baseUrl}/patchNote/${insertedId}`, {
      title: "New Title",
      content: "New Content"
    });
    expect(patchResponse.status).toBe(200);

    // Verification: Fetch the note and verify changes
    const getResponse = await axios.get(`${baseUrl}/getAllNotes`);
    const newNote = getResponse.data.response.find(note => note._id === insertedId);
    expect(newNote.title).toBe("New Title");
    expect(newNote.content).toBe("New Content");
    
  });

  test("/patchNote - Patch with just title", async () => {
    // Setup: Create a note
    const insertedId = await setupNote("Title Only Before", "Content Unchanged");

    const originResponse = await axios.get(`${baseUrl}/getAllNotes`);
    const checkNote = originResponse.data.response.find(note => note._id === insertedId);
    expect(checkNote.title).toBe("Title Only Before");
    expect(checkNote.content).toBe("Content Unchanged");

    // Patch the note's title only
    const patchResponse = await axios.patch(`${baseUrl}/patchNote/${insertedId}`, {
      title: "Title Only After"
    });
    expect(patchResponse.status).toBe(200);

    // Verification
    const getResponse = await axios.get(`${baseUrl}/getAllNotes`);
    const newNote = getResponse.data.response.find(note => note._id === insertedId);
    expect(newNote.title).toBe("Title Only After");
    // Content should remain unchanged
    expect(newNote.content).toBe("Content Unchanged");
  });

  test("/patchNote - Patch with just content", async () => {
    // Setup
    const insertedId = await setupNote("Title Unchanged", "Content Only Before");

    const originResponse = await axios.get(`${baseUrl}/getAllNotes`);
    const checkNote = originResponse.data.response.find(note => note._id === insertedId);
    expect(checkNote.title).toBe("Title Unchanged");
    expect(checkNote.content).toBe("Content Only Before");
    
    // Patch the note's content only
    const patchResponse = await axios.patch(`${baseUrl}/patchNote/${insertedId}`, {
      content: "Content Only After"
    });
    expect(patchResponse.status).toBe(200);

    // Verification
    const getResponse = await axios.get(`${baseUrl}/getAllNotes`);
    const updatedNote = getResponse.data.response.find(note => note._id === insertedId);
    expect(updatedNote.content).toBe("Content Only After");
    // Title should remain unchanged
    expect(updatedNote.title).toBe("Title Unchanged");
  });

  test("/deleteAllNotes - Delete one note", async () => {
    // Setup: Ensure there's only one note to delete
    await setupNote("Single Note", "This is the only note.");

    const deleteResponse = await axios.delete(`${baseUrl}/deleteAllNotes`);
    expect(deleteResponse.status).toBe(200);

    // Verification: Ensure no notes are left
    const getResponse = await axios.get(`${baseUrl}/getAllNotes`);
    expect(getResponse.data.response.length).toBe(0);
  });

  test("/deleteAllNotes - Delete three notes", async () => {
    // Setup: Create three notes
    await setupNote("Note 1", "Content 1");
    await setupNote("Note 2", "Content 2");
    await setupNote("Note 3", "Content 3");

    const deleteResponse = await axios.delete(`${baseUrl}/deleteAllNotes`);
    expect(deleteResponse.status).toBe(200);

    // Verification: Ensure no notes are left
    const getResponse = await axios.get(`${baseUrl}/getAllNotes`);
    expect(getResponse.data.response.length).toBe(0);
  });

});

  
  
  
  

  
  
  
  
  
    