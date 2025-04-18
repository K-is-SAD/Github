import ReadmeContent from '@/models/ReadmeContent';
import dbconnect from '../connectDatabase';

//Creates or updates readme content for a repository

export async function saveReadmeContent(
  repoUrl : string,
  userId : string,
  content : string,
  category : string,
  edited : boolean,
) {
  await dbconnect();
  
  try {
    const existingcontent = await ReadmeContent.findOne({
    repoUrl,
    userId: userId,
    })

    if(existingcontent){
      existingcontent.posts.push({
        content : content,
        category : category,
        edited : edited,
        createdAt : new Date(Date.now())
      })

      await existingcontent.save();

      return {
        success: true,
        message : "Readme content updated successfully",
        data : existingcontent
      }
    }

    const newcontent = new ReadmeContent({
      repoUrl : repoUrl,
      userId : userId,
      posts : [{
        content : content,
        category : category,
        edited : edited,
        createdAt : new Date(Date.now())
      }]
    })

    await newcontent.save();

    return {
      success : true,
      message : "Readme content created successfully",
      data : newcontent
    }
  } catch (error:any) {
    return {
      success : false,
      message : error.message
    }
  }

}

/**
 * Gets all readme contents for a repository
 */
export async function getReadmeContentHistory(repoUrl: string, userId : string) {
  await dbconnect();

  try {

    const content = await ReadmeContent.aggregate([
      {
        $match : {
          userId : userId,
          repoUrl : repoUrl
        }
      },
      {
        $unwind : '$posts'
      },
      {
        $group : {
          _id : '$posts.category', 
          posts : {
            $push : '$posts'
          }
        }
      },
      {
        $sort : {
          'posts.createdAt' : -1
        }
      },
      {
        $group : {
          _id : '$repoUrl', 
          posts : {
            $push : '$posts'
          }
        }
      }
    ])

    if(content.length === 0){
      return {
      success : false,
      message : "No history to display!"
      }
    }

    return {
      success: true,
      message : "Histories fetched successsfully",
      data : content[0].posts
    }
    
  } catch (error:any) {
    return {
      success : false,
      message : error.message
    }
  }
}

/**
 * Gets the latest content versions for a repository
 */
export async function getLatestReadmeContent(repoUrl : string, userId : string) {
  await dbconnect();

  try {

    const latestcontent = await ReadmeContent.findOne({
      repoUrl : repoUrl,
      userId: userId
    }).sort({ 'posts.createdAt': -1 }).select('-userId -repoUrl');

    if(!latestcontent){
      return {
        success : false,
        message : "No history to display!"
      }
    }

    return {
      success: true,
      message : "Histories fetched successsfully",
      data : latestcontent.posts[0].content
    }

  } catch (error:any) {
    return {
      success : false,
      message : error.message
    }
  }
}

/**
 * Deletes a specific readme content version
 */
export async function deleteReadmeContent(repoUrl: string, userId : string, content : string) {
  await dbconnect();
  
  try {
    const existingcontent = await ReadmeContent.findOne({
      repoUrl : repoUrl,
      userId : userId,
      posts : {
        content : content
      }
    })

    if(!existingcontent){
      return {
        success : false,
        message : "No history to delete!"
      }
    }

    const updatedcontent = await ReadmeContent.updateOne(
      { repoUrl : repoUrl, userId : userId },
      { $pull: { posts: { content : content } } },
      { new: true }
    )

    if(!updatedcontent){
      return {
        success : false,
        message : "Deletion failed!"
      }
    }

    return {
      success: true,
      message : "Histories fetched successsfully",
      data : updatedcontent
    }

  } catch (error:any) {
    return {
      success : false,
      message : error.message
    }
  }
}