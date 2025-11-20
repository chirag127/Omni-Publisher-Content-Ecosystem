```
return {
        platform: this.name,
        success: true,
        url: response.data.url || '',
        postId: response.data.id || ''
      };
    } catch (error: any) {
      return {
        platform: this.name,
        success: false,
        error: error.message || JSON.stringify(error)
      };
    }
  }
}
```;
