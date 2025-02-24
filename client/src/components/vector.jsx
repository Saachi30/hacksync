// Vector embeddings utility functions for query classification

/**
 * Creates a simple TFIDF model for query classification
 * This is a simplified vector embedding approach for demonstration
 * In a production app, you would use a proper NLP library or embedding model
 * 
 * @param {Object} queryTypes - Object with query types as keys and array of sample phrases as values
 * @returns {Object} - The TFIDF model
 */
export const createTFIDF = (queryTypes) => {
    // Create a vocabulary of all words
    const vocabulary = new Set();
    const documents = {};
    const wordCounts = {};
    
    // Process all sample queries
    Object.entries(queryTypes).forEach(([type, samples]) => {
      documents[type] = [];
      samples.forEach(sample => {
        const words = sample.toLowerCase().split(/\W+/).filter(word => word.length > 0);
        documents[type].push(words);
        words.forEach(word => vocabulary.add(word));
      });
    });
    
    // Count word occurrences in each document type
    vocabulary.forEach(word => {
      wordCounts[word] = {};
      Object.keys(queryTypes).forEach(type => {
        wordCounts[word][type] = documents[type].reduce((count, doc) => {
          return count + (doc.includes(word) ? 1 : 0);
        }, 0);
      });
    });
    
    // Calculate TF-IDF weights
    const totalDocTypes = Object.keys(queryTypes).length;
    const tfidf = {};
    
    vocabulary.forEach(word => {
      tfidf[word] = {};
      
      // Count how many document types contain this word
      const docTypesWithWord = Object.values(wordCounts[word]).filter(count => count > 0).length;
      if (docTypesWithWord === 0) return;
      
      // Calculate IDF (Inverse Document Frequency)
      const idf = Math.log(totalDocTypes / docTypesWithWord);
      
      Object.keys(queryTypes).forEach(type => {
        // Calculate TF (Term Frequency)
        const totalDocs = documents[type].length;
        if (totalDocs === 0) return;
        
        const tf = wordCounts[word][type] / totalDocs;
        
        // Calculate TF-IDF
        tfidf[word][type] = tf * idf;
      });
    });
    
    return { tfidf, vocabulary: Array.from(vocabulary), queryTypes: Object.keys(queryTypes) };
  };
  
  /**
   * Classifies a query using the TFIDF model
   * 
   * @param {string} query - The user's query to classify
   * @param {Object} model - The TFIDF model created by createTFIDF
   * @returns {string} - The classified query type(s)
   */
  export const classifyQuery = (query, model) => {
    const { tfidf, vocabulary, queryTypes } = model;
    
    // Tokenize the query
    const words = query.toLowerCase().split(/\W+/).filter(word => word.length > 0);
    
    // Calculate scores for each query type
    const scores = {};
    queryTypes.forEach(type => {
      scores[type] = 0;
      
      words.forEach(word => {
        if (vocabulary.includes(word) && tfidf[word] && tfidf[word][type]) {
          scores[type] += tfidf[word][type];
        }
      });
    });
    
    // Get the top scoring types (if score is above threshold)
    const threshold = 0.1;
    const results = [];
    
    queryTypes.forEach(type => {
      if (scores[type] > threshold) {
        results.push(type);
      }
    });
    
    // Return all matching types or 'general' if none match
    return results.length > 0 ? results.join(',') : 'general';
  };