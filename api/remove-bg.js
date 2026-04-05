const handleProcess = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", image);

    try {
      // Direct call to the endpoint defined in vercel.json rewrites
      // temporary axios call as requested
      const response = await api.post('/remove-bg', formData, {
        responseType: "blob",
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (!response || !response.data) {
        throw new Error("Empty response from server");
      }

      const imageUrl = URL.createObjectURL(response.data);
      setResult(imageUrl);
    } catch (err) {
      console.error("Error removing background", err);

      let msg = "Failed to remove background";
      if (err?.response) {
        // Handle server-side errors (500, 504, etc.)
        msg = err.response?.data?.error || `Server error: ${err.response.status}`;
      } else if (err?.request) {
        // Handle network/CORS issues
        msg = "Unable to reach API server. Check network, CORS, or API URL.";
      } else if (err?.message) {
        msg = err.message;
      }

      setError(msg);
    } finally {
      setLoading(false);
    }