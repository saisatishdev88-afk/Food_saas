
<div class="container">
    <h2>Edit To-Do</h2>

    <form action="{{ route('home.update', $todo->id) }}" method="POST" class="card p-4 shadow-sm">
        @csrf

        <div class="mb-3">
            <label for="name" class="form-label">Name</label>
            <input type="text" name="name" class="form-control" value="{{ $todo->name }}">
        </div>

        <div class="mb-3">
            <label for="description" class="form-label">Description</label>
            <textarea name="description" class="form-control" rows="3">{{ $todo->description }}</textarea>
        </div>

        <div class="mb-3">
            <label for="created_at" class="form-label">Due Date</label>
            <input type="date" name="created_at" class="form-control" value="{{ $todo->created_at }}">
        </div>

        <button type="submit" class="btn btn-primary">Update</button>
        <a href="{{ route('home.index') }}" class="btn btn-secondary">Back</a>
    </form>
</div>

