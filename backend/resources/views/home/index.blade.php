<style>
    #chat-ui {
        position: fixed;
        top: 50%;
        left: 70%;
        transform: translate(-50%, -50%);
        width: 380px;
        height: 520px;
        background: #f2f2f2;
        border-radius: 16px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        display: flex;
        flex-direction: column;
        font-family: 'Segoe UI', sans-serif;
        overflow: hidden;
        z-index: 9999;
    }

    #chat-header {
        background: #007bff;
        color: white;
        padding: 12px 16px;
        font-size: 16px;
        font-weight: bold;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .toggle-container {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 13px;
    }

    /* Toggle switch */
    .switch {
        position: relative;
        display: inline-block;
        width: 40px;
        height: 22px;
    }

    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.3s;
        border-radius: 34px;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 16px;
        width: 16px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
    }

    input:checked + .slider {
        background-color: #28a745;
    }

    input:checked + .slider:before {
        transform: translateX(18px);
    }

    #messages {
        flex-grow: 1;
        padding: 12px 16px;
        overflow-y: auto;
        font-size: 14px;
    }

    .message {
        margin: 8px 0;
        padding: 10px 14px;
        border-radius: 20px;
        max-width: 75%;
        word-wrap: break-word;
        display: inline-block;
        clear: both;
        line-height: 1.4;
    }

    .user-message {
        background-color: #007bff;
        color: white;
        float: right;
        border-bottom-right-radius: 4px;
    }

    .ai-message {
        background-color: #e9e9eb;
        float: left;
        border-bottom-left-radius: 4px;
    }

    #chat-input {
        display: flex;
        align-items: center;
        padding: 10px 12px;
        border-top: 1px solid #ddd;
        background: white;
    }

    #user-input {
        flex: 1;
        height: 40px;
        padding: 10px;
        border: none;
        border-radius: 20px;
        background-color: #f1f1f1;
        font-size: 14px;
        resize: none;
        outline: none;
    }

    #send-message {
        margin-left: 10px;
        width: 40px;
        height: 40px;
        border: none;
        border-radius: 50%;
        background-color: #28a745;
        color: white;
        font-size: 18px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    #send-message:hover {
        background-color: #218838;
    }

</style>

<!-- resources/views/home/index.blade.php -->
<div class="container">
    <div class="row">
        <!-- Left Side Content -->
        <div class="col-md-6" id="left-side">
            <div class="content-box">
                <h3>Welcome to Our Service</h3>
                <p>Here you can book appointments, get information about our services, or chat with us!</p>
                <p><strong>Why Choose Us?</strong></p>
                <ul>
                    <li>24/7 customer support</li>
                    <li>Fast and reliable services</li>
                    <li>Easy online booking</li>
                    <li>Access to exclusive offers</li>
                </ul>
            </div>
        </div>

        <!-- Right Side Chat UI -->
        <div class="col-md-6" id="chat-ui">
            <div id="chat-header">
                <div class="toggle-container">
                    <label class="switch">
                        <input type="checkbox" id="mode-toggle-switch">
                        <span class="slider round"></span>
                    </label>
                    <span id="mode-label">Test Mode</span>
                </div>
            </div>

            <div id="messages"></div>

            <div id="chat-input">
                <textarea id="user-input" placeholder="Type a message..."></textarea>
                <button id="send-message"><span>&#10148;</span></button>
            </div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
<script>
    let chatMode = 'test';

    // Handle toggle switch
    document.getElementById('mode-toggle-switch').addEventListener('change', function () {
        chatMode = this.checked ? 'live' : 'test';
        document.getElementById('mode-label').textContent = this.checked ? 'Live Mode' : 'Test Mode';
        console.log("Chat mode:", chatMode);
    });

    // Send message
    document.getElementById('send-message').addEventListener('click', function () {
        var userInput = document.getElementById('user-input').value.trim();
        if (userInput) {
            axios.post('{{ route('chat') }}', {
                message: userInput,
                mode: chatMode
            }).then(function (response) {
                var messages = document.getElementById('messages');
                messages.innerHTML += '<div class="message user-message">' + userInput + '</div>';
                messages.innerHTML += '<div class="message ai-message">' + response.data.reply + '</div>';
                messages.scrollTop = messages.scrollHeight;
                document.getElementById('user-input').value = '';
            }).catch(function (error) {
                console.error('Error sending message:', error);
            });
        }
    });
</script>


