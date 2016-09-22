export interface IScreen {
    show();
    dispose();

    preupdate(dt: number);
    update(dt: number);
    postupdate(dt: number);
    prerender(dt: number);
    render(dt: number);
    postrender(dt: number);
}
