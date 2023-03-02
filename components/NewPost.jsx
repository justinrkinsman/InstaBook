const NewPost = () => {
    return(
        <>
            <h1>Create New Post</h1>
            <form action='/new-post' method='POST' id='new-post-form'>
                <div className='form-group'>
                    <label htmlFor="post_body">Post Content:</label>
                    <textarea id='post_body' className="form-control" type='text' placeholder="Your Message text here" name='post_body'></textarea>
                </div>
                <button className="btn btn-primary" type='submit'>Submit</button>
                <a href='/'>Cancel</a>
            </form>
        </>   
    )
}