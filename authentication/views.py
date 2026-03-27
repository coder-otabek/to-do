from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, logout, update_session_auth_hash
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm, PasswordChangeForm
from django.contrib import messages

from .forms import CustomUserRegistrationForm, ChangeProfileForm, TodoForms
from .models import Todo, Profile


# @login_required(login_url='/login/')
def index(request):
    # Agar foydalanuvchi kirmagan bo'lsa, bazaga murojaat qilmaslik kerak
    if not request.user.is_authenticated:
        return render(request, 'index.html', {'todos': []})

    # Faqat kiritilgan foydalanuvchi uchun profil va todolarni olish
    profile, _ = Profile.objects.get_or_create(user=request.user)
    todos = Todo.objects.filter(author=profile).order_by('-id')

    # Filtrlash qismlari (o'zgarishsiz qoladi)
    status = request.GET.get('status')
    q = request.GET.get('q')
    priority = request.GET.get('priority')

    if priority:
        todos = todos.filter(priority=priority)
    if q:
        todos = todos.filter(title__icontains=q)
    if status:
        todos = todos.filter(status=status)

    return render(request, 'index.html', {
        'todos': todos
    })

def register(request):
    if request.user.is_authenticated:
        return redirect('/')

    form = CustomUserRegistrationForm(request.POST or None)
    if form.is_valid():
        form.save()
        return redirect('/login')

    return render(request, 'register.html', {
        'form': form,
    })


def login_view(request):
    if request.user.is_authenticated:
        return redirect('home')

    form = AuthenticationForm(request, data=request.POST or None)

    if request.method == 'POST' and form.is_valid():
        user = form.get_user()
        login(request, user)
        return redirect(request.GET.get('next') or 'home')

    return render(request, 'login.html', {
        'form': form,
    })


@login_required
def logout_view(request):
    if request.method == 'POST':
        logout(request)
        return redirect('/login')

    return render(request, 'logout.html')


@login_required
def profile(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)

    return render(request, "profile.html", {
        'profile': profile,
    })


@login_required
def profile_change(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)

    if request.method == "POST":
        form = ChangeProfileForm(
            request.POST,
            request.FILES,
            instance=profile,
            user=request.user
        )

        if form.is_valid():
            profile = form.save(commit=False)

            user = request.user
            user.username = form.cleaned_data.get('username')
            user.email = form.cleaned_data.get('email')

            full_name = form.cleaned_data.get('full_name')
            if full_name:
                parts = full_name.split(' ', 1)
                user.first_name = parts[0]
                user.last_name = parts[1] if len(parts) > 1 else ""

            user.save()
            profile.save()

            messages.success(request, "Profil yangilandi ✅")
            return redirect("profile")
    else:
        form = ChangeProfileForm(
            instance=profile,
            initial={
                'username': request.user.username,
                'email': request.user.email,
                'full_name': f"{request.user.first_name} {request.user.last_name}".strip()
            },
            user=request.user
        )

    return render(request, "change_profile.html", {
        'form': form,
        'profile': profile
    })


@login_required
def change_password(request):
    if request.method == 'POST':
        form = PasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            user = form.save()
            update_session_auth_hash(request, user)
            return redirect('profile')
    else:
        form = PasswordChangeForm(user=request.user)

    return render(request, 'change_password.html', {
        'form': form,
    })


@login_required
def created(request):
    profile, _ = Profile.objects.get_or_create(user=request.user)

    if request.method == 'POST':
        form = TodoForms(request.POST)
        if form.is_valid():
            obj = form.save(commit=False)
            obj.author = profile
            obj.save()
            return redirect('/')
    else:
        form = TodoForms()

    return render(request, 'created.html', {'form': form})

@login_required
def edit(request, pk):
    profile = request.user.profile
    todo = get_object_or_404(Todo, id=pk, author=profile)

    form = TodoForms(request.POST or None, instance=todo)
    if form.is_valid():
        obj = form.save(commit=False)
        obj.author = profile
        obj.save()
        return redirect('/')

    return render(request, 'single.html', {
        'form': form,
        'todo': todo
    })


@login_required
def delete(request, pk):
    profile = request.user.profile
    todo = get_object_or_404(Todo, id=pk, author=profile)

    if request.GET.get('ans'):
        todo.delete()
        return redirect('/')

    return render(request, 'delete.html', {
        'todo': todo
    })