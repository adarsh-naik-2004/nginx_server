import{serve} from 'bun'

serve({
    fetch(request){
        const url = new URL(request.url)
        if(url.pathname === '/'){
            return new Response('Kohli The Real Captain', {status: 200})
        }
        else if(url.pathname === '/klr'){
            return new Response('Kl Rahul the prince who never became king', {status: 200})
        }
        else{
            return new Response('File not Found', {status: 404})
        }
    },
    port: 3000,
    hostname: '127.0.0.1'
})

// kuch nhi hai sb same hai bun wan sb ,, node best