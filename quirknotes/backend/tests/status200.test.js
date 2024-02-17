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
    await deleteAllNotes();
  });

  test("/getAllNotes - Return list of zero notes for getAllNotes", async () => {
      // Act: Fetch all notes from the API
      const response = await axios.get(`${baseUrl}/getAllNotes`);

      // Assert: Check if the response is successful and the notes list is empty
      expect(response.status).toBe(200);
      expect(response.data.response).toEqual([]);
    });
  
     
  test("/getAllNotes - Return list of two notes for getAllNotes", async () => {
    // Arrange: Set up two notes
    await setupNote("debug1", "try1111");
    await setupNote("test2", "testtry");

    // Act: Fetch all notes from the API
    const response = await axios.get(`${baseUrl}/getAllNotes`);

    // Assert: Check if the response is successful and contains exactly two notes
    expect(response.status).toBe(200);
    expect(response.data.response.length).toBe(2);
    expect(response.data.response.some(note => note.title === "debug1" && note.content === "try1111")).toBe(true);
    expect(response.data.response.some(note => note.title === "test2" && note.content === "testtry")).toBe(true);
    });
  

  test("/deleteNote - Delete a note", async () => {

  // Arrange: Create a new note and verify its existence
  const noteId = await setupNote("Delete things i wnat", "Delete all of it");
  let response = await axios.get(`${baseUrl}/getAllNotes`);
  expect(response.data.response.find(note => note._id === noteId)).toBeDefined();

  // Act: Delete the created note
  response = await axios.delete(`${baseUrl}/deleteNote/${noteId}`);
  expect(response.status).toBe(200);

  // Assert: Verify the note has been deleted
  response = await axios.get(`${baseUrl}/getAllNotes`);
  expect(response.data.response.find(note => note._id === noteId)).toBeUndefined();
});

  test("/updateNoteColor - Update color of a note to red (#FF0000)", async () => {
    const createId = await setupNote("Color Change", "This note will change color.");

    const updateReact = await axios.patch(`${baseUrl}/updateNoteColor/${createId}`, {
      color: "#FF0000"
    });
    expect(updateReact.status).toBe(200);

    // Verification: Fetch the note and verify the color change
    const getReact = await axios.get(`${baseUrl}/getAllNotes`);
    const updatedNote = getReact.data.response.find(note => note._id === createId);
    expect(updatedNote.color).toBe("#FF0000");
  });


  test("/patchNote - Patch with content and title", async () => {
    // Setup: Create a note to patch
    const createId = await setupNote("Patch Title", "Patch Content");

    //
    const originResponse = await axios.get(`${baseUrl}/getAllNotes`);
    const checkNote = originResponse.data.response.find(note => note._id === createId);
    expect(checkNote.title).toBe("Patch Title");
    expect(checkNote.content).toBe("Patch Content");
    
    // Patch the note
    const patchResponse = await axios.patch(`${baseUrl}/patchNote/${createId}`, {
      title: "New Title",
      content: "New Content"
    });
    expect(patchResponse.status).toBe(200);

    // Verification: Fetch the note and verify changes
    const getResponse = await axios.get(`${baseUrl}/getAllNotes`);
    const newNote = getResponse.data.response.find(note => note._id === createId);
    expect(newNote.title).toBe("New Title");
    expect(newNote.content).toBe("New Content");
    
  });

  test("/patchNote - Patch with just title", async () => {
    // Setup: Create a note
    const createId = await setupNote("Title Only Before", "Content Unchanged");

    const originResponse = await axios.get(`${baseUrl}/getAllNotes`);
    const checkNote = originResponse.data.response.find(note => note._id === createId);
    expect(checkNote.title).toBe("Title Only Before");
    expect(checkNote.content).toBe("Content Unchanged");

    // Patch the note's title only
    const patchResponse = await axios.patch(`${baseUrl}/patchNote/${createId}`, {
      title: "Title Only After"
    });
    expect(patchResponse.status).toBe(200);

    // Verification
    const getResponse = await axios.get(`${baseUrl}/getAllNotes`);
    const newNote = getResponse.data.response.find(note => note._id === createId);
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

    const deleteReact = await axios.delete(`${baseUrl}/deleteAllNotes`);
    expect(deleteReact.status).toBe(200);

    // Verification: Ensure no notes are left
    const getReact = await axios.get(`${baseUrl}/getAllNotes`);
    expect(getReact.data.response.length).toBe(0);
  });

  test("/deleteAllNotes - Delete three notes", async () => {
    // Setup: Create three notes
    await setupNote("Note 1", "Content 1");
    await setupNote("Note 2", "Content 2");
    await setupNote("Note 3", "Content 3");
    await setupNote("Note 4", "Content 4");
    await setupNote("Note 5", "Content 5");

    const deleteReact = await axios.delete(`${baseUrl}/deleteAllNotes`);
    expect(deleteReact.status).toBe(200);

    // Verification: Ensure no notes are left
    const getReact = await axios.get(`${baseUrl}/getAllNotes`);
    expect(getReact.data.response.length).toBe(0);
  });

});

  
  
  
  

  
  
  
  
  
    