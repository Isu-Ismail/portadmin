import { mount } from 'svelte'
import './app.css'
import App from './app/App.svelte'

const target = document.getElementById('app')!
target.innerHTML = ''
mount(App, { target })

