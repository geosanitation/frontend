export interface Log{
    msg:string
    error:0|1|2
    importance:1|2
}
export interface Project{
    name:string
    email:string
    slug:string
    url:string
    log:Array<Log>
    created_at:string
    las_view:string
    disponible:boolean
    publish:boolean
    extent_4326:[number, number, number, number]
    compressFile:string
}