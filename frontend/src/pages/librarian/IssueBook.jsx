import React, { useState } from "react";
import api from "../../components/Axios";

const IssueBook = () => {
  const [formData, setFormData] = useState({ fileNo: "", bookIds: [""] });
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    if (name === "fileNo") {
      setFormData({ ...formData, fileNo: value });
    } else {
      const updatedBookIds = [...formData.bookIds];
      updatedBookIds[index] = value;
      setFormData({ ...formData, bookIds: updatedBookIds });
    }
  };

  const addBookField = () => setFormData({ ...formData, bookIds: [...formData.bookIds, ""] });
  const removeBookField = (index) => setFormData({ ...formData, bookIds: formData.bookIds.filter((_, i) => i !== index) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!formData.fileNo.trim()) {
      setMessage({ type: "error", text: "File Number is required." });
      setLoading(false);
      return;
    }
    if (formData.bookIds.some((id) => id.trim().length < 5)) {
      setMessage({ type: "error", text: "Each Book ID must be at least 5 digits." });
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/api/librarian/issue-book", formData);
      console.log(response)
      setMessage({
        type: response.data.success ? "success" : "error",
        text: response.data.message || (response.data.success ? "Books issued successfully!" : "Some books could not be issued."),
        details: [
          response.data.issuedBooks?.length ? `✅ Issued: ${response.data.issuedBooks.join(", ")}` : null,
          response.data.notAvailableBooks?.length ? `❌ Not Available: ${response.data.notAvailableBooks.join(", ")}` : null,
        ].filter(Boolean),
      });
      if (response.data.success) {
        setFormData({ fileNo: "", bookIds: [""] });
      }
    } catch (error) {
      let errorMessage = "Server error. Please try again.";
      if (error.response) {
        errorMessage = error.response.data.message || "An error occurred.";
        if (error.response.data.errors) {
          errorMessage += ` ${Object.values(error.response.data.errors).flat().join(" ")}`;
        }
      } else if (error.request) {
        errorMessage = "Network error. Please check your connection.";
      }
      setMessage({ type: "error", text: errorMessage });
    }
    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-6">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl p-8 transition-all duration-300 hover:shadow-xl">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-6">📚 Issue Book</h2>
        
        {message && (
          <div className={`p-4 rounded-lg text-center text-lg font-medium 
            ${message.type === "success" ? "bg-green-100 text-green-800 border-l-4 border-green-500" : "bg-red-100 text-red-800 border-l-4 border-red-500"}
          `}>
            <p>{message.text}</p>
            {message.details?.map((detail, index) => (
              <p key={index} className="text-sm">{detail}</p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <InputField type="text" name="fileNo" value={formData.fileNo} onChange={handleChange} placeholder="📁 Student File No" required />
          
          {formData.bookIds.map((bookId, index) => (
            <div key={index} className="flex items-center space-x-2">
              <InputField type="text" name="bookId" value={bookId} onChange={(e) => handleChange(e, index)} placeholder="📖 Book ID (Min 5 digits)" required />
              {index > 0 && (
                <button type="button" onClick={() => removeBookField(index)} className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-md">
                  ✖
                </button>
              )}
            </div>
          ))}

          <button type="button" onClick={addBookField} className="w-full p-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-md hover:shadow-lg">
            ➕ Add Another Book
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-lg text-white font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all duration-200 flex justify-center items-center shadow-lg"
          >
            {loading ? <LoadingSpinner /> : "📤 Issue Book"}
          </button>
        </form>
      </div>
    </div>
  );
};

const InputField = ({ type, name, value, onChange, placeholder, required }) => (
  <input
    type={type}
    name={name}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-2 focus:ring-indigo-400 transition-all duration-300 hover:bg-gray-100 hover:shadow-md"
  />
);

const LoadingSpinner = () => (
  <svg className="w-6 h-6 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
  </svg>
);

export default IssueBook;
