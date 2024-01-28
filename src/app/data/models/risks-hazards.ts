export interface PublicPicture {
    image_id?: number
    image: string
    description: string
    uploader_name: string
    uploader_email: string
    is_approved?: boolean
    taken_at: string
    geom?: string
}

export interface PublicPicturePaginated {
    next: string
    previous: string
    count: number
    page_size: number
    results: PublicPicture[]
  }
  
  export const PIC_STATUS = [
    {
      name: "Non approuvée",
      value: false
    },
    {
      name: "Approuvée",
      value: true
    },

  ]