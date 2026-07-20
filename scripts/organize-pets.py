from PIL import Image
import os

SRC_DIR = '/Users/yier/Documents/daijinli网页版/daijinli-miniapp/assets-concepts/collection-samples'
DST_DIR = '/Users/yier/Documents/daijinli网页版/daijinli-miniapp/src/assets/collection'

PET_MAP = [
    ('橘猫', 'OrangeCat', 'A_cute_orange_tabby_cat__chibi_2026-07-20T03-29-12.png'),
    ('蓝猫', 'BlueCat', 'Pixel_art_style_illustration_o_2026-07-20T02-39-28.png'),
    ('银渐层', 'SilverShaded', 'Pixel_art_style_illustration_o_2026-07-20T02-39-27.png'),
    ('布偶', 'Ragdoll', 'A_cute_ragdoll_cat__chibi_pixe_2026-07-20T03-29-44.png'),
    ('柯基', 'Corgi', 'Pixel_art_of_a_cute_corgi_dog__2026-07-20T02-43-18.png'),
    ('柴犬', 'Shiba', 'Pixel_art_of_a_cute_shiba_inu__2026-07-20T02-43-19.png'),
    ('泰迪', 'Poodle', 'Pixel_art_of_a_cute_toy_poodle_2026-07-20T02-43-19.png'),
    ('金毛', 'GoldenRetriever', 'Pixel_art_of_a_cute_golden_ret_2026-07-20T02-43-19.png'),
    ('哈士奇', 'Husky', 'Pixel_art_of_a_cute_siberian_h_2026-07-20T02-43-19.png'),
    ('萨摩耶', 'Samoyed', 'Pixel_art_of_a_cute_samoyed_do_2026-07-20T02-43-19.png'),
    ('边牧', 'BorderCollie', 'Pixel_art_of_a_cute_border_col_2026-07-20T02-43-19.png'),
    ('仓鼠', 'Hamster', 'Pixel_art_of_a_cute_hamster_si_2026-07-20T02-43-19.png'),
    ('垂耳兔', 'LopRabbit', 'Pixel_art_of_a_cute_lop_rabbit_2026-07-20T02-43-19.png'),
    ('龙猫', 'Chinchilla', 'Pixel_art_of_a_cute_chinchilla_2026-07-20T02-43-18.png'),
    ('小熊猫', 'RedPanda', 'Pixel_art_of_a_cute_red_panda__2026-07-20T02-43-19.png'),
    ('企鹅', 'Penguin', 'Pixel_art_of_a_cute_penguin_st_2026-07-20T02-43-18.png'),
]

os.makedirs(DST_DIR, exist_ok=True)

for cn_name, en_name, src_name in PET_MAP:
    src_path = os.path.join(SRC_DIR, src_name)
    dst_path = os.path.join(DST_DIR, f'pet-{en_name.lower()}-120.png')

    if not os.path.exists(src_path):
        print(f'[MISSING] {cn_name}: {src_name}')
        continue

    img = Image.open(src_path)
    # 转成 RGBA 保留透明
    if img.mode != 'RGBA':
        img = img.convert('RGBA')

    # 居中裁剪为正方形
    width, height = img.size
    min_size = min(width, height)
    left = (width - min_size) // 2
    top = (height - min_size) // 2
    img = img.crop((left, top, left + min_size, top + min_size))

    # 缩放到 120x120，使用最近邻保持像素风硬边缘
    img = img.resize((120, 120), Image.NEAREST)

    img.save(dst_path, 'PNG')
    print(f'[OK] {cn_name} -> {dst_path}')

print('Done.')
